import { integrationManager, logger } from "@utils/firebot";
import { integrationId } from "@/main";
import { integration } from "@/spotifyIntegration";
import { SpotifyService } from "@utils/spotify";

export default class SpotifyAuthService {
  private spotify: SpotifyService;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  /**
   * Retrieves the current access token. If the current token is expired or
   * unavailable, it will be refreshed.
   *
   * @return {Promise<string>} The current access token.
   */
  public async getCurrentAccessTokenAsync(): Promise<string> {
    const { access_token: accessToken } = this.getSpotifyAuthFromIntegration();

    if (!(await this.tokenExpiredAsync(accessToken))) {
      return accessToken;
    }

    return await integration.refreshToken();
  }

  //#region Helper Functions
  private getSpotifyAuthFromIntegration = (): AuthDefinition =>
    integrationManager.getIntegrationById(integrationId).definition.auth;

  private async tokenExpiredAsync(accessToken: string | undefined) {
    if (!accessToken) return true;

    const { expires_on: expiresOn } = this.getSpotifyAuthFromIntegration();

    if (
      (expiresOn && parseInt(expiresOn) < Date.now()) ||
      !(await this.spotifyIsConnectedAsync(accessToken))
    )
      return true;
  }

  private spotifyIsConnectedAsync = async (accessToken: string) =>
    (
      await fetch("https://api.spotify.com/v1/me", {
        headers: {
          Authorization: "Bearer " + accessToken,
        },
      })
    ).ok;
  //#endregion
}
