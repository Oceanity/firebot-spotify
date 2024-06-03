import { SpotifyService } from "@utils/spotify";

export default class SpotifyProfileService {
  private spotify: SpotifyService;

  private userProfile: SpotifyUserProfile | null = null;
  private pollUserAt: number = 0;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async getUserProfileAsync(): Promise<SpotifyUserProfile> {
    try {
      if (this.userProfile && this.pollUserAt > Date.now()) {
        return this.userProfile;
      }

      var response = await this.spotify.api.fetch<SpotifyUserProfile>("/me");

      if (!response.data) {
        throw new Error("Could not fetch Spotify User Profile");
      }

      this.userProfile = response.data;
      this.pollUserAt = Date.now() + 3600 * 1000;

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public isUserPremiumAsync = async (): Promise<boolean> =>
    (await this.getUserProfileAsync()).product === "premium";
}
