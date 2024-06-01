import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyNowPlayingArtistVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyNowPlayingArtist",
    description:
      "Gets the primary artist of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyNowPlayingArtist",
    possibleDataOutput: ["text"],
  },
  async evaluator() {
    try {
      if (!(await spotify.player.isPlayingAsync())) return "";

      const currentlyPlaying = await spotify.player.getCurrentlyPlaying();

      return currentlyPlaying ? currentlyPlaying.artists[0].name : "";
    } catch (error) {
      return "";
    }
  },
};
