import {
  SPOTIFY_INTEGRATION_AUTHOR,
  SPOTIFY_INTEGRATION_DESCRIPTION,
  SPOTIFY_INTEGRATION_FIREBOT_VERSION,
  SPOTIFY_INTEGRATION_ID,
  SPOTIFY_INTEGRATION_NAME,
  SPOTIFY_INTEGRATION_VERSION,
} from "@/constants";
import {
  generateSpotifyDefinition,
  generateSpotifyIntegration,
} from "@/spotify-integration";
import { checkRemoteScriptVersionAsync } from "@/utils";
import { SpotifyService } from "@/utils/spotify/index";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { Effects } from "@crowbartools/firebot-custom-scripts-types/types/effects";
import { NotificationType } from "@crowbartools/firebot-custom-scripts-types/types/modules/notification-manager";
import { initModules } from "@oceanity/firebot-helpers/firebot";
import { AllSpotifyEffects } from "./firebot/effects";
import { SpotifyEventSource } from "./firebot/events/spotifyEventSource";
import { AllSpotifyCustomRoutes } from "./firebot/routes";
import { AllSpotifyReplaceVariables } from "./firebot/variables";

export let spotify: SpotifyService;

type Params = {
  spotifyClientId: string;
  spotifyClientSecret: string;
  spotifyCallbackHostname: string;
};

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: SPOTIFY_INTEGRATION_NAME,
      description: SPOTIFY_INTEGRATION_DESCRIPTION,
      author: SPOTIFY_INTEGRATION_AUTHOR,
      version: SPOTIFY_INTEGRATION_VERSION,
      firebotVersion: SPOTIFY_INTEGRATION_FIREBOT_VERSION,
    };
  },
  getDefaultParameters: () => {
    return {
      spotifyClientId: {
        type: "string",
        title: "Spotify Client Id",
        default: "",
        description:
          "Client Id from an application registered at developer.spotify.com",
      },

      spotifyClientSecret: {
        type: "string",
        title: "Spotify Client Secret",
        default: "",
        description:
          "Client Secret from an application registered at developer.spotify.com",
      },

      spotifyCallbackHostname: {
        type: "string",
        title: "Spotify Callback Hostname",
        default: "127.0.0.1",
        description: "Callback Hostname for the Spotify API.",
      },
    };
  },
  run: async (runRequest) => {
    const { spotifyClientId, spotifyClientSecret, spotifyCallbackHostname } =
      runRequest.parameters;

    const {
      effectManager,
      eventManager,
      httpServer,
      integrationManager,
      logger,
      replaceVariableManager,
      notificationManager,
    } = runRequest.modules;

    const paramErrors = Object.entries(runRequest.parameters)
      .filter(([_, value]) => !value)
      .map(([key]) =>
        key
          .replace(/([a-z])([A-Z])/g, "$1 $2")
          .replace(/^\w/, (c) => c.toUpperCase())
      );

    if (paramErrors.length) {
      logger.error(`Missing required parameters: ${paramErrors.join(", ")}`);
      return;
    }

    spotify = new SpotifyService();

    // Setup globals
    initModules(runRequest.modules);

    const client: ClientCredentials = {
      id: spotifyClientId,
      secret: spotifyClientSecret,
    };

    const updateResponse = await checkRemoteScriptVersionAsync();
    if (updateResponse.newVersionAvailable) {
      const notificationTitle = `${SPOTIFY_INTEGRATION_NAME} v${updateResponse.remoteVersion}`;

      // If they already have active notification, let's not spam them, but if they have one that's read and they didn't actually update, I mean... :3
      if (
        notificationManager
          .getNotifications()
          .some((n) => n.title === notificationTitle && n.read === false)
      ) {
        return;
      }

      notificationManager.addNotification({
        type: "update" as NotificationType,
        title: notificationTitle,
        message: `A new update for **${SPOTIFY_INTEGRATION_NAME}** has been releaed: **v${updateResponse.localVersion} -> v${updateResponse.remoteVersion}**\n\n[Go here to grab the latest version!](https://github.com/Oceanity/firebot-spotify/releases/latest)`,
      });
    }

    // Register Replace Variables
    for (const variable of AllSpotifyReplaceVariables) {
      replaceVariableManager.registerReplaceVariable(variable);
    }

    // Register Effects
    for (const effect of AllSpotifyEffects) {
      effect.definition.id = `${SPOTIFY_INTEGRATION_ID}:${effect.definition.id}`;

      effectManager.registerEffect(
        effect as Effects.EffectType<{ [key: string]: any }>
      );
    }

    // Register Events
    SpotifyEventSource.id = SPOTIFY_INTEGRATION_ID;
    eventManager.registerEventSource(SpotifyEventSource);

    // Register Webhooks
    for (const webhook of AllSpotifyCustomRoutes) {
      const [path, method, handler] = webhook;
      httpServer.registerCustomRoute(
        SPOTIFY_INTEGRATION_ID,
        path,
        method,
        handler
      );
    }

    const [definition, integration] = [
      generateSpotifyDefinition(client, spotifyCallbackHostname),
      generateSpotifyIntegration(client),
    ];

    // Register integration
    integrationManager.registerIntegration({
      definition,
      integration,
    });

    await spotify.init();
  },
};

export default script;
