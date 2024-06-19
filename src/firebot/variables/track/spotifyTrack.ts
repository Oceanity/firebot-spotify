import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrack",
    description:
      "Gets an object containing information about the currently playing track",
    usage: "spotifyTrackAlbum",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track.album,
};
