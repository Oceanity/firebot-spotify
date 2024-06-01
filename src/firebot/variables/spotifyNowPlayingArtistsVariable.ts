import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyNowPlayingArtistsVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyNowPlayingArtists",
    description:
      "Gets all the artists of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyNowPlayingArtists",
    possibleDataOutput: ["text"],
  },
  async evaluator() {
    try {
      if (!(await spotify.player.isPlayingAsync())) return "";

      return (await spotify.player.getCurrentlyPlaying()).artists
        .map((artist) => artist.name)
        .join(", ");
    } catch (error) {
      return "";
    }
  },
};
