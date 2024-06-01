import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyNowPlayingUrlVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyNowPlayingUrl",
    description:
      "Gets the url of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyNowPlayingUrl",
    possibleDataOutput: ["text"],
  },
  async evaluator() {
    try {
      if (!(await spotify.player.isPlayingAsync())) return "";

      return (await spotify.player.getCurrentlyPlaying()).external_urls.spotify;
    } catch (error) {
      return "";
    }
  },
};
