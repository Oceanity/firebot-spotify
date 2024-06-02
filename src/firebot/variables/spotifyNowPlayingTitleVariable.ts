import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyNowPlayingTitleVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyNowPlayingTitle",
    description:
      "Gets the title of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyNowPlayingTitle",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track?.title ?? "",
};
