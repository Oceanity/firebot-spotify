import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import {
  generateSpotifyIntegration,
  generateSpotifyDefinition,
} from "@/spotifyIntegration";

import { initModules } from "@utils/firebot";
import { SpotifyService } from "./utils/spotify/index";

export const integrationId = "oceanity-spotify";
export const spotify = new SpotifyService();

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Firebot Spotify Integrations",
      description: "Let your viewers determine your taste in music",
      author: "Oceanity",
      version: "0.6.0",
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
  },
};

export default script;
