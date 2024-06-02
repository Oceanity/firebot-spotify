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
  evaluator: async () => spotify.player.track?.albumArtUrl ?? "",
};
