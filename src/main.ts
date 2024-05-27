import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import Store from "@utils/store";
import { initLogger } from "@utils/logger";
import { generateSpotifyIntegration, integration } from "@/spotifyIntegration";

import {
  generateSpotifyDefinition,
  SpotifyIntegration,
} from "./spotifyIntegration";

import spotifyEffects from "@effects/all";

const script: Firebot.CustomScript<Params> = {
  getScriptManifest: () => {
    return {
      name: "Spotify Song Requests",
      description: "Let your viewers determine your taste in music",
      author: "Oceanity",
      version: "1.0",
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
    const { effectManager, integrationManager, logger } = runRequest.modules;

    if (!spotifyClientId || !spotifyClientSecret) {
      logger.error(
        "Missing required Spotify Client ID or Client Secret",
        spotifyClientId,
        spotifyClientSecret
      );
      return;
    }

    initLogger(logger);

    // Setup globals
    Store.Modules = runRequest.modules;
    Store.SpotifyApplication = {
      clientId: spotifyClientId,
      clientSecret: spotifyClientSecret,
    };

    const definition = generateSpotifyDefinition();
    const integration = generateSpotifyIntegration();

    // Register integration
    integrationManager.registerIntegration({
      definition,
      integration,
    });

    // Register effects
    spotifyEffects.forEach((effect) => {
      effectManager.registerEffect(effect);
    });
  },
  stop: () => {
    integration.disconnect();
  },
};

export default script;
