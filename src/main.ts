import {
  SPOTIFY_INTEGRATION_AUTHOR,
  SPOTIFY_INTEGRATION_DESCRIPTION,
  SPOTIFY_INTEGRATION_FIREBOT_VERSION,
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
import { chatFeedAlert, initModules } from "@oceanity/firebot-helpers/firebot";

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
    const { integrationManager, logger } = runRequest.modules;

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

    const [definition, integration] = [
      generateSpotifyDefinition(client, spotifyCallbackHostname),
      generateSpotifyIntegration(client),
    ];

    // Register integration
    integrationManager.registerIntegration({
      definition,
      integration,
    });

    //@ts-expect-error ts2339
    runRequest.modules.twitchChat.on("connected", async () => {
      const updateResponse = await checkRemoteScriptVersionAsync();

      if (!updateResponse.newVersionAvailable) return;

      await chatFeedAlert(
        `A new update of Spotify Integration by Oceanity is available (${updateResponse.localVersion} -> ${updateResponse.remoteVersion})! Visit https://github.com/Oceanity/firebot-spotify/releases/latest to download it!`
      );
    });

    await spotify.init();
  },
};

export default script;
