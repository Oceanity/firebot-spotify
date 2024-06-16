import { logger } from "@utils/firebot";
import SpotifyApiService from "./api";
import SpotifyAuthService from "./auth";
import { SpotifyDeviceService } from "./device";
import { SpotifyEventService } from "./events";
import SpotifyProfileService from "./me";
import SpotifyPlayerService from "./player";
import { getErrorMessage } from "../string";

export class SpotifyService {
  public readonly api: SpotifyApiService;
  public readonly auth: SpotifyAuthService;
  public readonly device: SpotifyDeviceService;
  public readonly events: SpotifyEventService;
  public readonly me: SpotifyProfileService;
  public readonly player: SpotifyPlayerService;

  constructor() {
    this.api = new SpotifyApiService(this);
    this.auth = new SpotifyAuthService(this);
    this.device = new SpotifyDeviceService();
    this.events = new SpotifyEventService();
    this.me = new SpotifyProfileService(this);
    this.player = new SpotifyPlayerService(this);
  }

  public async init() {
    await this.player.init();
  }

  public async searchAsync(
    query: string,
    types: SpotifyContextType[] | SpotifyContextType,
    limit: number = 20,
    offset: number = 0
  ): Promise<SpotifySearchResponse> {
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
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  public getIdFromUri = (uri?: string) => uri?.split(":")[2] ?? "";
}
