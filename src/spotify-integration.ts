import {
  SPOTIFY_INTEGRATION_ID,
  SPOTIFY_INTEGRATION_NAME,
  SPOTIFY_SCOPES,
} from "@/constants";
import ResponseError from "@models/responseError";
import { integrationManager, logger } from "@oceanity/firebot-helpers/firebot";
import { now } from "@utils/time";

import {
  IntegrationController,
  IntegrationData,
  IntegrationEvents,
} from "@crowbartools/firebot-custom-scripts-types";
import { TypedEmitter } from "tiny-typed-emitter";
import { SpotifyIntegrationSettings } from "./types";

class IntegrationEventEmitter extends TypedEmitter<IntegrationEvents> {}

let spotifyDefinition: IntegrationDefinition | null = null;

export class SpotifyIntegration
  extends IntegrationEventEmitter
  implements IntegrationController<SpotifyIntegrationSettings>
{
  connected: boolean = false;
  expiresAt: number | null = null;

  constructor(client: ClientCredentials) {
    super();
    spotifyDefinition = generateSpotifyDefinition(client);
  }

  init(
    linked: boolean,
    integrationData: IntegrationData<SpotifyIntegrationSettings>
  ): void | PromiseLike<void> {
    try {
      logger.info("Initializing Spotify Integration...");
      logger.info(
        linked
          ? "Spotify Integration is linked"
          : "Spotify Integration is not linked"
      );
      logger.info(JSON.stringify(integrationData));

      if (linked && !this.connected) {
        this.connected = true;
        logger.info("Spotify Integration is now connected");
      }
    } catch (error) {
      logger.error("Error initializing Spotify Integration:", error);
      throw error;
    }
  }

  async link() {
    logger.info("Linking to Spotify Integration...");
  }

  async unlink() {
    logger.info("Unlinking from Spotify Integration...");
  }

  async onUserSettingsUpdate(
    integrationData: IntegrationData<SpotifyIntegrationSettings>
  ) {
    logger.info("Integration Data", integrationData);
  }

  private async initSpotifyIntegration() {}

  async refreshToken(): Promise<AuthDefinition | null> {
    try {
      const currentAuth = getSpotifyAuthFromIntegration();

      if (
        currentAuth.access_token &&
        this.expiresAt &&
        this.expiresAt - now() > 5000
      ) {
        return currentAuth;
      }

      logger.info("Token expired, refreshing...");

      // @ts-ignore
      const { authProviderDetails: authProvider } = spotifyDefinition;
      const auth = getSpotifyAuthFromIntegration();

      if (auth != null) {
        if (!integrationManager) {
          throw new Error("Required var SpotifyIntegrationManager is null");
        }
        if (!auth.refresh_token) {
          throw new Error("No refresh token");
        }

        const response = await fetch(
          `${authProvider.auth.tokenHost}${authProvider.auth.tokenPath}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: `Basic ${btoa(
                `${authProvider.client.id}:${authProvider.client.secret}`
              )}`,
            },
            body: new URLSearchParams({
              grant_type: "refresh_token",
              refresh_token: auth.refresh_token ?? "",
            }),
          }
        );

        if (!response.ok) {
          throw new ResponseError("Could not refresh Spotify token", response);
        }

        const data = (await response.json()) as SpotifyRefreshTokenResponse;
        data.refresh_token = auth.refresh_token;

        this.expiresAt = now() + data.expires_in * 1000;
        logger.info(
          `New token expires at ${new Date(this.expiresAt).toUTCString()}`
        );

        updateIntegrationAuth(data);

        return getSpotifyAuthFromIntegration();
      }
    } catch (error) {
      logger.error("Error refreshing Spotify token", error);
    }
    return null;
  }
}

export const generateSpotifyDefinition = (
  client: ClientCredentials,
  redirectUriHost: string = "127.0.0.1"
): IntegrationDefinition => ({
  id: SPOTIFY_INTEGRATION_ID,
  name: SPOTIFY_INTEGRATION_NAME,
  description:
    "Integrations with Spotify that can show now playing information and control your Spotify devices.",
  connectionToggle: false,
  linkType: "auth",
  settingCategories: {},
  authProviderDetails: {
    id: SPOTIFY_INTEGRATION_ID,
    name: "Spotify",
    redirectUriHost,
    client,
    auth: {
      type: "code",
      authorizeHost: "https://accounts.spotify.com",
      authorizePath: "/authorize",
      tokenHost: "https://accounts.spotify.com",
      tokenPath: "/api/token",
    },
    autoRefreshToken: false,
    scopes: SPOTIFY_SCOPES.join(" "),
  },
});

export function generateSpotifyIntegration(client: ClientCredentials) {
  integration = new SpotifyIntegration(client);
  return integration;
}

export let integration: SpotifyIntegration;

// #region Helper Functions
const getSpotifyAuthFromIntegration = (): AuthDefinition =>
  integrationManager.getIntegrationById(SPOTIFY_INTEGRATION_ID).definition.auth;

function updateIntegrationAuth(data: unknown) {
  const currentIntegration = integrationManager.getIntegrationById(
    SPOTIFY_INTEGRATION_ID
  );
  //@ts-expect-error ts2339
  integrationManager.saveIntegrationAuth(currentIntegration, data);
}
// #endregion
