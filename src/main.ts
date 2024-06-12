import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import {
  generateSpotifyIntegration,
  generateSpotifyDefinition,
} from "@/spotifyIntegration";

import { initModules } from "@utils/firebot";
import { SpotifyService } from "./utils/spotify/index";
import { checkRemoteVersionAsync } from "./firebot/webhooks/versionCheck";

export const integrationId = "oceanity-spotify";
export const version = "0.7.1";
export const spotify = new SpotifyService();

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Firebot Spotify Integrations",
      description: "Let your viewers determine your taste in music",
      author: "Oceanity",
      version,
      firebotVersion: "5",
    };
  },
  getDefaultParameters: () => {
    return {
      spotifyClientId: {
        type: "string",
        default: "",
        description: "Spotify Client Id",
        secondaryDescription:
          "Client Id from an application registered at developer.spotify.com",
      },

      spotifyClientSecret: {
        type: "string",
        default: "",
        description: "Spotify Client Secret",
        secondaryDescription:
          "Client Secret from an application registered at developer.spotify.com",
      },
    };
  },
  run: async (runRequest) => {
    const { spotifyClientId, spotifyClientSecret } = runRequest.parameters;
    const { integrationManager, logger } = runRequest.modules;

    if (!spotifyClientId || !spotifyClientSecret) {
      logger.error(
        "Missing required Spotify Client ID or Client Secret",
        spotifyClientId,
        spotifyClientSecret
      );
      return;
    }

    // Setup globals
    initModules(runRequest.modules);

    const client: ClientCredentials = {
      id: spotifyClientId,
      secret: spotifyClientSecret,
    };

    const [definition, integration] = [
      generateSpotifyDefinition(client),
      generateSpotifyIntegration(client),
    ];

    // Register integration
    integrationManager.registerIntegration({
      definition,
      integration,
    });

    //@ts-expect-error ts2339
    runRequest.modules.twitchChat.on("connected", async () => {
      const updateResponse = await checkRemoteVersionAsync();

      if (updateResponse.newVersionAvailable) {
        //@ts-expect-error ts2339
        const effect = runRequest.modules.effectManager.getEffectById(
          "firebot:chat-feed-alert"
        );

        if (!effect || !effect.onTriggerEvent) {
          logger.error("Unable to trigger chat feed alert");
          return;
        }

        await effect.onTriggerEvent({
          effect: {
            message: `A new update of Spotify Integration by Oceanity is available (${updateResponse.currentVersion} -> ${updateResponse.latestVersion})! Visit https://github.com/Oceanity/firebot-spotify/releases/latest to download it!`,
          },
          trigger: {
            type: "custom_script",
            metadata: {
              username: "script",
            },
          },
        });
      }
    });
  },
};

export default script;
