import { logger } from "@utils/firebot";
import { SpotifyService } from ".";
import ResponseError from "@/models/responseError";

const baseUrl = "https://api.spotify.com/v1";

export default class SpotifyApiService {
  private readonly spotify: SpotifyService;
  private retryAfter: number | null = null;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public readonly baseUrl = "https://api.spotify.com/v1";
  public getUrlFromPath = (path: string): string => `${baseUrl}${path}`;

  public async fetch<T>(
    endpoint: string,
    method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
    options?: any
  ) {
    try {
      if (this.retryAfter && Date.now() < this.retryAfter) {
        throw new Error(
          `API Rate Limit Exceeded, will be able to use again after ${new Date(
            this.retryAfter
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
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          this.retryAfter = retryAfter
            ? Date.now() + parseInt(retryAfter)
            : null;
        }

        throw new ResponseError(
          `Spotify API /v1/${endpoint} returned status ${response.status}`,
          response
        );
      }

      return {
        status: response.status,
        ok: response.ok,
        data: response.status === 204 ? null : ((await response.json()) as T),
      };
    } catch (error) {
      logger.error("Error making Spotify API request", error);
      throw error;
    }
  }
}
