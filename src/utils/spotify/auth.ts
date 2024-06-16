import { integrationManager, logger } from "@utils/firebot";
import { integrationId } from "@/main";
import { integration } from "@/spotifyIntegration";
import { SpotifyService } from "@utils/spotify";
import { getErrorMessage } from "@/utils/string";

export default class SpotifyAuthService {
  private spotify: SpotifyService;
  private expiresAt: number = 0;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  //#region Getters

  /**
   * Checks if the Spotify integration is linked.
   *
   * @return {boolean} True if the integration is linked, false otherwise.
   */
  public get isLinked(): boolean {
    try {
      return integrationManager.getIntegrationById(integrationId).definition
        .linked;
    } catch (error) {
      return false;
    }
  }

  /**
   * Retrieves the current access token. If the current token is expired or
   * unavailable, it will be refreshed.
   *
   * @return {Promise<string>} A Promise that resolves to the current access token.
   */
  public get accessToken(): Promise<string> {
    return this.getCurrentAccessTokenAsync();
  }

  //#endregion

  //#region Helper Functions
  private async getCurrentAccessTokenAsync(): Promise<string> {
    try {
      const { access_token: accessToken } =
        this.getSpotifyAuthFromIntegration();

      if (!(await this.tokenExpiredAsync(accessToken))) {
        return accessToken;
      }

      const refreshResponse = await integration.refreshToken();

      if (!refreshResponse) {
        throw new Error("Failed to refresh token");
      }

      this.expiresAt = performance.now() + refreshResponse.expires_in * 1000;

      logger.info(
        `Refreshed Spotify Token. New Token will expire at ${new Date(
          this.expiresAt
        ).toUTCString()}`
      );

      return refreshResponse.access_token;
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      return "";
    }
  }

  private getSpotifyAuthFromIntegration = (): AuthDefinition =>
    integrationManager.getIntegrationById(integrationId).definition.auth;

  private async tokenExpiredAsync(accessToken: string | undefined) {
    if (!accessToken) return true;

    if (this.expiresAt && this.expiresAt - performance.now() > 5000)
      return false;

    // Check against API just in case of config issue
    return !(await this.spotifyIsConnectedAsync(accessToken));
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
