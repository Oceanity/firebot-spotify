import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import Store from "@utils/store";
// import Db from "@/utils/db";
// import { run } from "node:test";
import Spotify from "./utils/spotify";
import SpotifyGateway from "./api/spotifyGateway";

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
    const { logger } = runRequest.modules;

    if (!spotifyClientId || !spotifyClientSecret) {
      throw new Error("Missing Spotify credentials in Script Settings");
    }

    // Setup globals
    Store.SpotifyApplication = {
      clientId: spotifyClientId,
      clientSecret: spotifyClientSecret,
    };
    Store.Modules = runRequest.modules;
    Store.WebserverPort = runRequest.firebot.settings.getWebServerPort();
    Store.CallbackPath = "/oauth/callback";
    Store.RedirectUri = `http://localhost:${runRequest.firebot.settings.getWebServerPort()}/integrations/${
      Store.Prefix
    }${Store.CallbackPath}`;

    Store.Modules.logger.info(Store.WebserverPort.toString());

    Spotify.registerEndpoints();
    SpotifyGateway.registerEndpoints();

    if (!Store.SpotifyAuth.code) {
      logger.info(
        `Spotify Client Id: ${spotifyClientId}, Secret: ${spotifyClientSecret}`
      );
      await Spotify.openLoginPage();
    }
  },
};

export default script;
