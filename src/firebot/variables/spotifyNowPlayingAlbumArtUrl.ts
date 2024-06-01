import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyNowPlayingAlbumArtUrlVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyNowPlayingAlbumArtUrl",
    description:
      "Gets the album art url of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyNowPlayingAlbumArtUrl",
    possibleDataOutput: ["text"],
  },
  async evaluator() {
    try {
      if (!(await spotify.player.isPlayingAsync())) return "";

      return (await spotify.player.getCurrentlyPlaying()).album.images.sort(
        (a, b) => b.width - a.width
      );
    } catch (error) {
      return "";
    }
  },
};
