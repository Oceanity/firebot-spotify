import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
const EventEmitter = require("events");
import { logger } from "@utils/logger";
import {
  FirebotParameterCategories,
  FirebotParams,
} from "@crowbartools/firebot-custom-scripts-types/types/modules/firebot-parameters";
const axios = require("axios").default;
import Store from "@/utils/store";

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
    this.definition = generateSpotifyDefinition();
    this.integrationManager = Store.Modules.integrationManager;
  }

  init() {}

  async connect(integrationData: any) {
    const { auth } = integrationData;

    logger.info("Auth: " + JSON.stringify(auth));

    this.auth = auth;
    try {
      let accessToken = auth?.access_token;

      if (!(await spotifyIsConnected(accessToken))) {
        accessToken = await this.refreshToken();
      }

      if (!accessToken || !accessToken.length) {
        logger.info("hello2");
        this.emit("disconnected", this.definition.id);
        return;
      }

      logger.info("definition: " + JSON.stringify(this.definition));

      this.emit("connected", this.definition.id);
      this.connected = true;
    } catch (error) {
      logger.error("Error connecting to Spotify", error);
    }
  }

  disconnect() {
    this.connected = false;
    this.emit("disconnected", this.definition.id);
  }

  async link(linkData: { auth: any }) {
    const { auth } = linkData;
    this.auth = auth;
    let token = auth?.access_token;

    logger.info("Access: " + token);
    logger.info("Refresh: " + auth?.refresh_token);

    if (!(await spotifyIsConnected(token))) {
      token = await this.refreshToken();
    }
  }

  unlink() {}

  // Doing this here because of a bug in Firebot where it isn't refreshing automatically
  async refreshToken(): Promise<string | null> {
    try {
      const auth = this.auth;
      // @ts-ignore
      const authProvider = this.definition.authProviderDetails;

      if (auth != null) {
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
              refresh_token: auth.refresh_token,
            }),
          }
        );

        const data = await response.json();

        logger.info("Access: " + data.access_token);

        if (!response.ok) {
          throw new Error("could not refresh Spotify token");
        }

        const int = this.integrationManager.getIntegrationById("spotify");
        // @ts-ignore
        data["refresh_token"] = int.integration.auth.refresh_token;
        this.integrationManager.saveIntegrationAuth(int, data);
        return data.access_token;
      }
    } catch (error) {
      logger.error("Error refreshing Spotify token", error);
    }
    return null;
  }
}

export let integration: SpotifyIntegration;
