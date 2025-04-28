import { namespace } from "@/main";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import ResponseError from "@models/responseError";
import {
  effectManager,
  eventManager,
  httpServer,
  integrationManager,
  logger,
  variableManager,
} from "@oceanity/firebot-helpers/firebot";
import { now } from "@utils/time";
import { EventEmitter } from "events";
import { AllSpotifyEffects } from "./firebot/effects";
import { SpotifyEventSource } from "./firebot/events/spotifyEventSource";
import { AllSpotifyReplaceVariables } from "./firebot/variables";
import { AllSpotifyWebhooks } from "./firebot/webhooks";

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
  expiresAt: number | null = null;

  constructor(client: ClientCredentials) {
    super();
    spotifyDefinition = generateSpotifyDefinition(client);
  }

  async init() {
    logger.info("Initializing Spotify Integration...");

    // Register Effects
    for (const effect of AllSpotifyEffects) {
      effect.definition.id = `${namespace}:${effect.definition.id}`;

      effectManager.registerEffect(
        effect as Effects.EffectType<{ [key: string]: any }>
      );
    }

    // Free Replace Variables
    for (const variable of AllSpotifyReplaceVariables) {
      variableManager.registerReplaceVariable(variable);
    }

    // Register Events
    SpotifyEventSource.id = namespace;
    eventManager.registerEventSource(SpotifyEventSource);

    // Register Webhooks
    for (const webhook of AllSpotifyWebhooks) {
      const [path, method, handler] = webhook;
      httpServer.registerCustomRoute(namespace, path, method, handler);
    }
  }

  async connect() {}

  async link() {
    logger.info("Linking to Spotify Integration...");
  }

  async unlink() {
    logger.info("Unlinking from Spotify Integration...");
  }

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
  redirectUriHost: string = "localhost"
): IntegrationDefinition => ({
  id: namespace,
  name: "Spotify (by Oceanity)",
  description:
    "Integrations with Spotify that can show now playing information and control your Spotify devices.",
  connectionToggle: false,
  linkType: "auth",
  settingCategories: {},
  authProviderDetails: {
    id: namespace,
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
    autoRefreshToken: true,
    scopes: spotifyScopes.join(" "),
  },
});

export function generateSpotifyIntegration(client: ClientCredentials) {
  integration = new SpotifyIntegration(client);
  return integration;
}

export let integration: SpotifyIntegration;

// #region Helper Functions
const getSpotifyAuthFromIntegration = (): AuthDefinition =>
  integrationManager.getIntegrationById(namespace).definition.auth;

function updateIntegrationAuth(data: unknown) {
  const currentIntegration = integrationManager.getIntegrationById(namespace);
  //@ts-expect-error ts2339
  integrationManager.saveIntegrationAuth(currentIntegration, data);
}
// #endregion
