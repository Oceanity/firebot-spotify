import {
  IntegrationManager,
  ScriptModules,
} from "@crowbartools/firebot-custom-scripts-types";
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

let spotifyAuth: SpotifyAuth | null = null;
let spotifyDefinition: IntegrationDefinition | null = null;
let spotifyIntegrationManager: IntegrationManager | null = null;

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

let scriptModules: ScriptModules;
export function setScriptModules(modules: ScriptModules) {
  scriptModules = modules;
}

export const generateSpotifyDefinition = (): IntegrationDefinition => ({
  id: "spotify",
  name: "Spotify",
  description: "Allows for song requests",
  connectionToggle: false,
  linkType: "auth",
  settingCategories: {},
  authProviderDetails: {
    id: "spotify",
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
  auth: any;
  connected: boolean;

  constructor() {
    super();
    this.connected = false;
    spotifyDefinition = generateSpotifyDefinition();
    spotifyIntegrationManager = Store.Modules.integrationManager;
  }

  init() {}

  async connect(integrationData: any) {
    const { auth } = integrationData;

    if (!spotifyDefinition)
      throw new Error("Could not find Spotify Definition");

    logger.info("Auth: " + JSON.stringify(auth));

    spotifyAuth = auth;
    try {
      let accessToken = auth?.access_token;

      if (!(await spotifyIsConnected(accessToken))) {
        accessToken = await this.refreshToken();
      }

      if (!accessToken || !accessToken.length) {
        this.emit("disconnected", spotifyDefinition.id);
        return;
      }

      this.emit("connected", spotifyDefinition.id);
      this.connected = true;
    } catch (error) {
      logger.error("Error connecting to Spotify", error);
    }
  }

  async link(linkData: { auth: any }) {
    const { auth } = linkData;
    spotifyAuth = auth;
    let token = auth?.access_token;

    if (!(await spotifyIsConnected(token))) {
      token = await this.refreshToken();
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      if (!spotifyAuth) {
        throw new Error("Required var SpotifyAuth is null");
      }

      // @ts-ignore
      const authProvider = spotifyDefinition.authProviderDetails;

      if (spotifyAuth != null) {
        if (!spotifyIntegrationManager) {
          throw new Error("Required var SpotifyIntegrationManager is null");
        }
        if (!spotifyAuth.refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await (
          await fetch(
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
                refresh_token: spotifyAuth.refreshToken ?? "",
              }),
            }
          )
        ).json();

        logger.info("Access: " + response.access_token);

        if (!response) {
          throw new Error("could not refresh Spotify token");
        }

        const int = spotifyIntegrationManager.getIntegrationById("spotify");

        // @ts-ignore
        data["refresh_token"] = int.integration.auth.refresh_token;
        int.integration.saveIntegrationAuth(int, response);
        return response.access_token;
      }
    } catch (error) {
      logger.error("Error refreshing Spotify token", error);
    }
    return null;
  }
}

export let integration: SpotifyIntegration;
