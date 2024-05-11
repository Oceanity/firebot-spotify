import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import Store from "@utils/store";
// import Db from "@/utils/db";
// import { run } from "node:test";
import Spotify from "./utils/spotify";

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
    Store.Modules = runRequest.modules;
    Store.Parameters = runRequest.parameters;
    Store.WebserverPort = runRequest.firebot.settings.getWebServerPort();

    const { logger } = Store.Modules;
    const { spotifyClientId, spotifyClientSecret } = Store.Parameters;

    if (!spotifyClientId || !spotifyClientSecret) {
      throw new Error("Missing Spotify credentials in Script Settings");
    }

    Spotify.registerEndpoints();

    //Store.SpotifyToken = (await Db.getAsync("db/spotify", "token")) ?? null;

    if (!Store.SpotifyToken) {
      logger.info(
        `Spotify Client Id: ${spotifyClientId}, Secret: ${spotifyClientSecret}`
      );
      Spotify.openLoginPage();
    }
  },
};

export default script;
