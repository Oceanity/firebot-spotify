import {
  generateSpotifyDefinition,
  generateSpotifyIntegration,
} from "@/spotifyIntegration";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import * as packageJson from "../package.json";

export const {
  version,
  name: namespace,
  displayName: name,
  description,
  author,
} = packageJson;

import { chatFeedAlert, initModules } from "@oceanity/firebot-helpers/firebot";
import { checkRemoteVersionAsync } from "./firebot/webhooks/versionCheck";
import { SpotifyService } from "./utils/spotify/index";

export let spotify: SpotifyService;

type Params = {
  spotifyClientId: string;
  spotifyClientSecret: string;
  spotifyCallbackHostname: string;
};

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
        default: "localhost",
        description:
          "Callback Hostname for the Spotify API. If for some reason Spotify doesn't let you use `localhost`, try `127.0.0.1` instead.",
      },
    };
  },
  run: async (runRequest) => {
    const { spotifyClientId, spotifyClientSecret, spotifyCallbackHostname } =
      runRequest.parameters;
    const { integrationManager, logger } = runRequest.modules;

    const paramErrors = Object.entries(runRequest.parameters)
      .filter(([_, value]) => !!value)
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
