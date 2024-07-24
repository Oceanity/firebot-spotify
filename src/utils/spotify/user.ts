import { SpotifyService } from "@utils/spotify";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import { now } from "@utils/time";
import { logger } from "@utils/firebot";

export default class SpotifyProfileService {
  private readonly spotify: SpotifyService;
  private readonly minutesToRefresh: number = 60;

  private _userProfile?: SpotifyUserProfile | null = null;
  private _pollUserAt: number = 0;
  private _isPolling: boolean = false;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async init() {
    await this.getProfileAsync();
  }

  public get isPremium(): boolean {
    // Check for updates in background, but return data synchronously
    this.getProfileAsync();

    return this._userProfile?.product === "premium";
  }

  public async getProfileAsync(): Promise<SpotifyUserProfile> {
    try {
      if (this._userProfile && (this._isPolling || this._pollUserAt > now())) {
        return this._userProfile ?? null;
      }

      if (this._isPolling) {
        throw new Error("Currently performing first poll for user profile");
      }

      await this.updateProfileAsync();

      if (!this._userProfile) {
        throw new Error("Fetching profile failed");
      }

      return this._userProfile;
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  public async updateProfileAsync(): Promise<void> {
    try {
      var response = await this.spotify.api.fetch<SpotifyUserProfile>("/me");

      if (!response.ok) {
        throw new Error("Could not fetch Spotify User Profile");
      }

      this._userProfile = response.data;
      this._pollUserAt = now() + 1000 * 60 * this.minutesToRefresh;
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  public isPremiumAsync = async (): Promise<boolean> =>
    (await this.getProfileAsync())?.product === "premium";
}
