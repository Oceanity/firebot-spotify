import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyNowPlayingAlbumVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyNowPlayingAlbum",
    description:
      "Gets the album of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyNowPlayingAlbum",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track?.album ?? "",
};
