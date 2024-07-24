import { logger } from "@utils/firebot";
import { SpotifyApiService } from "./api";
import SpotifyAuthService from "./auth";
import { SpotifyEventService } from "./events";
import SpotifyProfileService from "./user";
import SpotifyPlayerService from "./player";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import ResponseError from "@/models/responseError";
import { SpotifySettingsService } from "./settings";
import { SpotifyArtistService } from "./artist";

type SearchOptions = {
  limit?: number;
  offset?: number;
  filterExplicit?: boolean;
  maxLengthMinutes?: number;
  allowDuplicates?: boolean;
};

export class SpotifyService {
  public readonly api: SpotifyApiService;
  public readonly artist: SpotifyArtistService;
  public readonly auth: SpotifyAuthService;
  public readonly events: SpotifyEventService;
  public readonly user: SpotifyProfileService;
  public readonly player: SpotifyPlayerService;
  public readonly settings: SpotifySettingsService;

  constructor() {
    this.api = new SpotifyApiService(this);
    this.artist = new SpotifyArtistService(this);
    this.auth = new SpotifyAuthService(this);
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

  public async getTrackAsync(id: string, options?: SearchOptions) {
    try {
      const response = await this.api.fetch<SpotifyTrackDetails>(
        `/tracks/${id}`
      );

      if (!response.data) {
        throw new ResponseError("Could not retrieve Spotify track", response);
      }

      const filterConflicts = this.trackFilterIssues(response.data, options);
      if (filterConflicts.length) {
        throw new ResponseError(
          `Spotify track was filtered for reasons: ${filterConflicts.join(
            ", "
          )}`,
          response
        );
      }

      return response.data;
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  public getIdFromUri = (uri?: string) => uri?.split(":")[2] ?? "";

  public getUriFromId = (id?: string) => (id ? `spotify:track:${id}` : "");

  private trackFilterIssues = (
    track: SpotifyTrackDetails,
    options?: SearchOptions
  ): FilterReason[] => {
    const reasons: FilterReason[] = [];

    if (!options) return reasons;

    if (options.filterExplicit && track.explicit) {
      reasons.push("explicit");
    }

    if (
      options.maxLengthMinutes &&
      options.maxLengthMinutes > 0 &&
      track.duration_ms < options.maxLengthMinutes! * 1000 * 60
    ) {
      reasons.push("duration");
    }

    return reasons;
  };
}
