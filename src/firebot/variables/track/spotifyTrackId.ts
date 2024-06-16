import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackIdVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackId",
    description:
      "Gets the Id of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackId",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.trackService.id,
};
