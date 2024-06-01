const EventEmitter = require("events");
import ResponseError from "@models/responseError";
import {
  logger,
  integrationManager,
  effectManager,
  variableManager,
} from "@utils/firebot";
import { SpotifyChangePlaybackStateEffect } from "@effects/spotifyChangePlaybackStateEffect";
import { SpotifyChangePlaybackVolumeEffect } from "@effects/spotifyChangePlaybackVolumeEffect";
import { SpotifyChangeRepeatStateEffect } from "@effects/spotifyChangeRepeatStateEffect";
import { SpotifyFindAndEnqueueTrackEffect } from "@effects/spotifyFindAndEnqueueTrackEffect";
import { SpotifySeekToPositionEffect } from "@effects/spotifySeekToPositionEffect";
import { SpotifySkipTrackEffect } from "@effects/spotifySkipTrackEffect";
import { integrationId } from "@/main";
import { SpotifyNowPlayingTitleVariable } from "@variables/spotifyNowPlayingTitleVariable";
import { SpotifyNowPlayingArtistVariable } from "@variables/spotifyNowPlayingArtistVariable";
import { SpotifyIsPlayingVariable } from "@variables/spotifyIsPlayingVariable";

const spotifyScopes = [
  "app-remote-control",
  "streaming",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-email",
  "user-read-playback-position",
  "user-read-playback-state",
  "user-read-private",
  "user-read-recently-played",
];

let spotifyDefinition: IntegrationDefinition | null = null;

export class SpotifyIntegration extends EventEmitter {
  connected: boolean = false;

  constructor(client: ClientCredentials) {
    super();
    spotifyDefinition = generateSpotifyDefinition(client);
  }

  init() {
    logger.info("Initializing Spotify Integration...");

    // Premium Effects
    effectManager.registerEffect(SpotifyFindAndEnqueueTrackEffect);
    effectManager.registerEffect(SpotifyChangePlaybackStateEffect);
    effectManager.registerEffect(SpotifyChangePlaybackVolumeEffect);
    effectManager.registerEffect(SpotifyChangeRepeatStateEffect);
    effectManager.registerEffect(SpotifySeekToPositionEffect);
    effectManager.registerEffect(SpotifySkipTrackEffect);

    // Free Replace Variables
    variableManager.registerReplaceVariable(SpotifyIsPlayingVariable);
    variableManager.registerReplaceVariable(SpotifyNowPlayingTitleVariable);
    variableManager.registerReplaceVariable(SpotifyNowPlayingArtistVariable);
  }

  async connect() {}

  async link() {
    logger.info("Linking to Spotify Integration...");
  }

  async unlink() {}

  async refreshToken(): Promise<string> {
    try {
      logger.info("Refreshing Spotify Token...");

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

        const data = await response.json();

        data["refresh_token"] = auth.refresh_token;
        data["expires_on"] = Date.now() + data.expires_in * 1000;

        updateIntegrationAuth(data);

        return data.access_token;
      }
    } catch (error) {
      logger.error("Error refreshing Spotify token", error);
    }
    return "";
  }
}

export const generateSpotifyDefinition = (
  client: ClientCredentials
): IntegrationDefinition => ({
  id: integrationId,
  name: "Spotify (by Oceanity)",
  description: "Integrations with Spotify including song requests",
  connectionToggle: false,
  linkType: "auth",
  settingCategories: {},
  authProviderDetails: {
    id: integrationId,
    name: "Spotify",
    redirectUriHost: "localhost",
    client,
    auth: {
      type: "code",
      authorizeHost: "https://accounts.spotify.com",
      authorizePath: "/authorize",
      tokenHost: "https://accounts.spotify.com",
      tokenPath: "/api/token",
    },
    autoRefreshToken: true,
    scopes: spotifyScopes.join(" "),
  },
});

export function generateSpotifyIntegration(client: ClientCredentials) {
  integration = new SpotifyIntegration(client);
  return integration;
}

export async function getCurrentAccessTokenAsync(): Promise<string> {
  let { access_token: accessToken, expires_on: expiresOn } =
    getSpotifyAuthFromIntegration();

  if (
    accessToken &&
    (!tokenPastExpiration(expiresOn) ||
      (await spotifyIsConnectedAsync(accessToken)))
  ) {
    return accessToken;
  }

  return await integration.refreshToken();
}

export let integration: SpotifyIntegration;

// #region Helper Functions
const getSpotifyAuthFromIntegration = (): AuthDefinition =>
  integrationManager.getIntegrationById(integrationId).definition.auth;

const spotifyIsConnectedAsync = async (accessToken: string) =>
  (
    await fetch("https://api.spotify.com/v1/me", {
      headers: {
        Authorization: "Bearer " + accessToken,
      },
    })
  ).ok;

const tokenPastExpiration = (expiresOn: string) =>
  new Date(expiresOn).getTime() < Date.now();

function updateIntegrationAuth(data: unknown) {
  const currentIntegration =
    integrationManager.getIntegrationById(integrationId);
  //@ts-expect-error ts2339
  integrationManager.saveIntegrationAuth(currentIntegration, data);
}
// #endregion
