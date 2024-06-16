import { SpotifyService } from "@utils/spotify";
import { getErrorMessage } from "@utils/string";
import { logger } from "@utils/firebot";

export default class SpotifyProfileService {
  private readonly spotify: SpotifyService;
  private readonly minutesToRefresh: number = 60;

  private _userProfile?: SpotifyUserProfile | null = null;
  private _pollUserAt: number = 0;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async getProfileAsync(): Promise<SpotifyUserProfile> {
    try {
      const now = performance.now();

      if (!!this._userProfile && this._pollUserAt > now) {
        return this._userProfile;
      }

      var response = await this.spotify.api.fetch<SpotifyUserProfile>("/me");

      if (!response.data) {
        throw new Error("Could not fetch Spotify User Profile");
      }

      this._userProfile = response.data;
      this._pollUserAt = now + 1000 * 60 * this.minutesToRefresh;

      return response.data;
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  public isPremiumAsync = async (): Promise<boolean> =>
    (await this.getProfileAsync()).product === "premium";
}
