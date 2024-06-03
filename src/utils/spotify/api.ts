import { chatFeedAlert, logger } from "@utils/firebot";
import { SpotifyService } from ".";
import ResponseError from "@/models/responseError";

type SpotifyRateLimits = {
  [endpoint: string]: number;
};

export default class SpotifyApiService {
  private readonly spotify: SpotifyService;
  private rateLimits: SpotifyRateLimits = {};

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public readonly baseUrl = "https://api.spotify.com/v1";
  public getUrlFromPath = (path: string): string => `${this.baseUrl}${path}`;

  public async fetch<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    options?: any
  ) {
    try {
      const sanitizedEndpoint = endpoint.split("?")[0];

      if (
        this.rateLimits.hasOwnProperty(sanitizedEndpoint) &&
        Date.now() < this.rateLimits[sanitizedEndpoint]
      ) {
        throw new Error(
          `API endpoint ${endpoint} Rate Limit Exceeded, will be able to use again after ${new Date(
            this.rateLimits[sanitizedEndpoint]
          ).toUTCString()}`
        );
      }

      const accessToken = await this.spotify.auth.accessToken;

      const response = await fetch(this.getUrlFromPath(endpoint), {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        ...options,
      });

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
              Date.now() + (retryAfter ? parseInt(retryAfter) : 3600) * 1000;
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

      return {
        status: response.status,
        ok: response.ok,
        data: response.status === 204 ? null : ((await response.json()) as T),
      };
    } catch (error) {
      let message =
        error instanceof Error
          ? error.message
          : "Unspecified Error with Spotify API request " + endpoint;
      chatFeedAlert(message);

      logger.error("Error making Spotify API request", error);
      throw error;
    }
  }
}
