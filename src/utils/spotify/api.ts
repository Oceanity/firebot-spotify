import { chatFeedAlert, logger } from "@utils/firebot";
import { SpotifyService } from ".";
import ResponseError from "@/models/responseError";
import {
  formatMsToTimecode,
  getErrorMessage,
} from "@oceanity/firebot-helpers/string";
import { mergeObjects } from "../object";

type SpotifyRateLimits = {
  [endpoint: string]: number;
};

type SpotifyFetchResponse<T> = {
  status: number;
  ok: boolean;
  data: T | null;
};

type SpotifyHttpRequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export class SpotifyApiService {
  private readonly spotify: SpotifyService;
  private rateLimits: SpotifyRateLimits = {};

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public readonly baseUrl = "https://api.spotify.com/v1";
  public getUrlFromPath = (path: string): string => `${this.baseUrl}${path}`;

  /**
   * Makes a request to the Spotify API.
   * @param endpoint The API endpoint to request.
   * @param method The HTTP method to use. Defaults to GET.
   * @param options Additional fetch options.
   * @returns An object containing the response status, ok status, and data.
   * @throws {ResponseError} If the response status is not OK.
   * @throws {Error} If there is an error with the request.
   */
  public async fetch<T>(
    endpoint: string,
    method: SpotifyHttpRequestMethod = "GET",
    options?: any
  ): Promise<SpotifyFetchResponse<T>> {
    try {
      const sanitizedEndpoint = endpoint.split("?")[0];
      const now = performance.now();

      if (
        this.rateLimits.hasOwnProperty(sanitizedEndpoint) &&
        now < this.rateLimits[sanitizedEndpoint]
      ) {
        throw new Error(
          `API endpoint ${endpoint} Rate Limit Exceeded, will be able to use again after ${formatMsToTimecode(
            this.rateLimits[sanitizedEndpoint] - now
          )}`
        );
      }

      const accessToken = await this.spotify.auth.accessToken;

      const url: string = this.getUrlFromPath(endpoint);

      const request: RequestInit = mergeObjects(
        {
          method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        options
      );
      const response = await fetch(url, request);

      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new ResponseError(
              `Spotify API endpoint ${endpoint} responded Unauthorized, try unlinking and relinking Spotify to generate a new Access/Refresh token pair`,
              response
            );
          case 429:
            const retryAfter = response.headers.get("retry-after");
            this.rateLimits[sanitizedEndpoint] =
              performance.now() +
              (retryAfter ? parseInt(retryAfter) : 3600) * 1000;
            throw new ResponseError(
              `Spotify API endpoint ${endpoint} responded Rate Limit Exceeded, will be able to use again after ${new Date(
                this.rateLimits[sanitizedEndpoint]
              ).toUTCString()}`,
              response
            );
          default:
            throw new ResponseError(
              `Spotify API ${endpoint} returned status ${response.status}`,
              response
            );
        }
      }

      if (response.status === 204 || method !== "GET") {
        return {
          status: response.status,
          ok: response.ok,
          data: null,
        };
      }

      const data = await response.json();

      return {
        status: response.status,
        ok: response.ok,
        data,
      };
    } catch (error) {
      const message = getErrorMessage(error);
      chatFeedAlert(message);

      logger.error(message, error);
      throw error;
    }
  }
}
