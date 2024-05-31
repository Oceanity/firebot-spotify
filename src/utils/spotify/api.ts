import { logger } from "@utils/firebot";
import { SpotifyService } from ".";
import ResponseError from "@/models/responseError";

const baseUrl = "https://api.spotify.com/v1";

export default class SpotifyApiService {
  private readonly spotify: SpotifyService;

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
      const accessToken = await this.spotify.auth.getCurrentAccessTokenAsync();

      const response = await fetch(this.getUrlFromPath(endpoint), {
        method,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        ...options,
      });

      if (!response.ok) {
        throw new ResponseError(
          `Spotify API /v1/${endpoint} returned status ${response.status}`,
          response
        );
      }

      // If no data response, return to avoid throwing an error
      if (response.status === 204) {
        return {
          status: response.status,
          data: null,
        };
      }

      const data: T = await response.json();

      return {
        status: response.status,
        data,
      };
    } catch (error) {
      logger.error("Error making Spotify API request", error);
      throw error;
    }
  }
}
