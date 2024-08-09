import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import {
  generateSpotifyIntegration,
  generateSpotifyDefinition,
} from "@/spotifyIntegration";
import * as packageJson from "../package.json";

export const { version, name: namespace, displayName: name, description, author } = packageJson;

import { initModules } from "@oceanity/firebot-helpers/firebot";
import { chatFeedAlert } from "@oceanity/firebot-helpers/firebot";
import { SpotifyService } from "./utils/spotify/index";
import { checkRemoteVersionAsync } from "./firebot/webhooks/versionCheck";

export let spotify: SpotifyService;

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name,
      description,
      author,
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

    spotify = new SpotifyService();

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

      if (!updateResponse.newVersionAvailable) return;

      await chatFeedAlert(
        `A new update of Spotify Integration by Oceanity is available (${updateResponse.localVersion} -> ${updateResponse.remoteVersion})! Visit https://github.com/Oceanity/firebot-spotify/releases/latest to download it!`
      );
    });

    await spotify.init();
  },
};

export default script;
