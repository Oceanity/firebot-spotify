import { SpotifyService } from "@utils/spotify/index";

export default class SpotifyProfileService {
  private spotify: SpotifyService;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async getUserProfileAsync(): Promise<SpotifyUserProfile> {
    try {
      var response = await this.spotify.api.fetch<SpotifyUserProfile>("/me");

      if (!response.data) {
        throw new Error("Could not fetch Spotify User Profile");
      }

      return response.data;
    } catch (error) {
      throw error;
    }
  }

  public isUserPremiumAsync = async (): Promise<boolean> =>
    (await this.getUserProfileAsync()).product === "premium";
}
