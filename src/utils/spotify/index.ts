import { logger } from "@utils/firebot";
import { SpotifyApiService } from "./api";
import SpotifyAuthService from "./auth";
import { SpotifyDeviceService } from "./device";
import { SpotifyEventService } from "./events";
import SpotifyProfileService from "./user";
import SpotifyPlayerService from "./player";
import { getErrorMessage } from "../string";
import ResponseError from "@/models/responseError";
import { SpotifySettingsService } from "./settings";
import { SpotifyArtistService } from "./artist";

type SearchOptions = {
  limit?: number;
  offset?: number;
  filterExplicit?: boolean;
  maxLengthMinutes?: number;
};

export class SpotifyService {
  public readonly api: SpotifyApiService;
  public readonly artist: SpotifyArtistService;
  public readonly auth: SpotifyAuthService;
  public readonly device: SpotifyDeviceService;
  public readonly events: SpotifyEventService;
  public readonly user: SpotifyProfileService;
  public readonly player: SpotifyPlayerService;
  public readonly settings: SpotifySettingsService;

  constructor() {
    this.api = new SpotifyApiService(this);
    this.artist = new SpotifyArtistService(this);
    this.auth = new SpotifyAuthService(this);
    this.device = new SpotifyDeviceService();
    this.events = new SpotifyEventService();
    this.user = new SpotifyProfileService(this);
    this.player = new SpotifyPlayerService(this);
    this.settings = new SpotifySettingsService(this);
  }

  public async init() {
    await this.player.init();
    await this.settings.init();
    await this.user.init();
  }

  public async searchAsync(
    query: string,
    types: SpotifyContextType[] | SpotifyContextType,
    options: SearchOptions = {}
  ): Promise<SpotifySearchResponse> {
    try {
      if (!Array.isArray(types)) {
        types = [types];
      }

      const encodedQuery = encodeURIComponent(query);

      const params = new URLSearchParams({
        q: encodedQuery,
        type: types.join(","),
        limit: String(options.limit ?? 50),
        offset: String(options.offset ?? 0),
      }).toString();

      const response = await this.api.fetch<SpotifySearchResponse>(
        `/search?${params}`
      );

      if (!response.data) {
        throw new Error("Could not retrieve Spotify track");
      }

      const results = response.data;
      results.filtered = {
        filteredTracks: [],
      };

      if (options.filterExplicit) {
        response.data.tracks.items = response.data.tracks.items.filter(
          (track) => {
            if (!track.explicit) return true;
            results.filtered.filteredTracks?.push({
              reason: "explicit",
              item: track,
            });
            return false;
          }
        );
      }

      if (options.maxLengthMinutes && options.maxLengthMinutes > 0) {
        response.data.tracks.items = response.data.tracks.items.filter(
          (track) => {
            if (track.duration_ms < options.maxLengthMinutes! * 1000 * 60)
              return true;
            results.filtered.filteredTracks?.push({
              reason: "duration",
              item: track,
            });
            return false;
          }
        );
      }

      return response.data;
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  public async getTrackAsync(id: string) {
    try {
      const response = await this.api.fetch<SpotifyTrackDetails>(
        `/tracks/${id}`
      );

      if (!response.data) {
        throw new ResponseError("Could not retrieve Spotify track", response);
      }

      return response.data;
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  public getIdFromUri = (uri?: string) => uri?.split(":")[2] ?? "";

  public getUriFromId = (id?: string) => (id ? `spotify:track:${id}` : "");
}
