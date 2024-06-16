import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackAlbumVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackAlbum",
    description:
      "Gets the album of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackAlbum",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.trackService.album,
};
