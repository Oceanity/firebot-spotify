const EventEmitter = require("events");
import { logger } from "@utils/logger";
import {
  FirebotParameterCategories,
  FirebotParams,
} from "@crowbartools/firebot-custom-scripts-types/types/modules/firebot-parameters";
import Store from "@utils/store";

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

export type IntegrationDefinition<
  Params extends FirebotParams = FirebotParams
> = {
  id: string;
  name: string;
  description: string;
  connectionToggle?: boolean;
  configurable?: boolean;
  settingCategories: FirebotParameterCategories<Params>;
} & (
  | {
      linkType: "id";
      idDetails: {
        steps: string;
      };
    }
  | {
      linkType: "auth";
      authProviderDetails: {
        id: string;
        name: string;
        redirectUriHost?: string;
        client: {
          id: string;
          secret: string;
        };
        auth: {
          type?: string;
          tokenHost: string;
          tokenPath: string;
          authorizePath: string;
          authorizeHost?: string;
        };
        autoRefreshToken?: boolean;
        scopes: string;
      };
    }
  | { linkType: "other" | "none" }
);

export const generateSpotifyDefinition = (): IntegrationDefinition => ({
  id: Store.IntegrationId,
  name: "Spotify (by Oceanity)",
  description: "Integrations with Spotify including song requests",
  connectionToggle: false,
  linkType: "auth",
  settingCategories: {},
  authProviderDetails: {
    id: Store.IntegrationId,
    name: "Spotify",
    redirectUriHost: "localhost",
    client: {
      id: Store.SpotifyApplication.clientId,
      secret: Store.SpotifyApplication.clientSecret,
    },
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

export function generateSpotifyIntegration() {
  integration = new SpotifyIntegration();
  return integration;
}

export async function spotifyIsConnected(
  accessToken: string
): Promise<boolean> {
  const headers = { Authorization: "Bearer " + accessToken }; // auth header with bearer token

  let res = await fetch("https://api.spotify.com/v1/me", {
    method: "GET",
    headers,
  });
  return res.ok;
}

export class SpotifyIntegration extends EventEmitter {
  connected: boolean = false;

  constructor() {
    super();
    spotifyDefinition = generateSpotifyDefinition();
  }

  init() {}

  async connect() {}

  async link() {
    logger.info("Linking to Spotify Integration...");
  }

  async unlink() {}

  async refreshToken(): Promise<string | null> {
    try {
      logger.info("Refreshing Spotify Token...");

      // @ts-ignore
      const authProvider = spotifyDefinition.authProviderDetails;
      const auth = getSpotifyAuthFromIntegration();

      if (auth != null) {
        if (!Store.Modules.integrationManager) {
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
          throw new Error(
            `Could not refresh Spotify token, ${JSON.stringify(response)}`
          );
        }

        const data = await response.json();

        logger.info(JSON.stringify(data));

        const int = Store.Modules.integrationManager.getIntegrationById(
          Store.IntegrationId
        );

        data["refresh_token"] = auth.refresh_token;
        //@ts-expect-error ts2339
        Store.Modules.integrationManager.saveIntegrationAuth(int, data);
        return data.access_token;
      }
    } catch (error) {
      logger.error("Error refreshing Spotify token", error);
    }
    return null;
  }
}

const getSpotifyAuthFromIntegration = (): AuthDefinition =>
  Store.Modules.integrationManager.getIntegrationById(Store.IntegrationId)
    .definition.auth;

export let integration: SpotifyIntegration;
