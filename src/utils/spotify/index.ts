import { logger } from "@utils/firebot";
import SpotifyApiService from "@utils/spotify/api";
import SpotifyAuthService from "@utils/spotify/auth";
import SpotifyPlayerService from "@utils/spotify/player";
import SpotifyProfileService from "@utils/spotify/me";

export class SpotifyService {
  public readonly api: SpotifyApiService;
  public readonly auth: SpotifyAuthService;
  public readonly me: SpotifyProfileService;
  public readonly player: SpotifyPlayerService;

  constructor() {
    this.api = new SpotifyApiService(this);
    this.auth = new SpotifyAuthService(this);
    this.me = new SpotifyProfileService(this);
    this.player = new SpotifyPlayerService(this);
  }

  public async searchAsync(
    query: string,
    types: SpotifyContextType[] | SpotifyContextType,
    limit: number = 20,
    offset: number = 0
  ) {
    try {
      if (!(types instanceof Array)) {
        types = [types];
      }

      const encodedQuery = encodeURIComponent(query);

      const params = new URLSearchParams({
        q: encodedQuery,
        type: types.join(","),
        limit: limit.toString(),
        offset: offset.toString(),
      }).toString();

      const response = await this.api.fetch<SpotifySearchResponse>(
        `/search?${params}`
      );

      if (!response.data) {
        throw new Error("Could not retrieve Spotify track");
      }

      return response.data;
    } catch (error) {
      logger.error("Error performing search on Spotify", error);
      throw error;
    }
  }

  public async getTrackAsync(id: string) {
    try {
      const response = await this.api.fetch<SpotifyTrackDetails>(
        `/tracks/${id}`
      );

      if (!response.data) {
        throw new Error("Could not retrieve Spotify track");
      }

      return response.data;
    } catch (error) {
      logger.error("Error getting Spotify track", error);
      throw error;
    }
  }
}
