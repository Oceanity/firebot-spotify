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
  async evaluator() {
    try {
      if (!(await spotify.player.isPlayingAsync())) return "";

      return (await spotify.player.getCurrentlyPlaying()).name;
    } catch (error) {
      return "";
    }
  },
};
