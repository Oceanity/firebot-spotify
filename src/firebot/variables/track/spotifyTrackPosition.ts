import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackPositionVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackPosition",
    description:
      "Gets current position in playing track on Spotify as formatted string or empty string if not playing",
    usage: "spotifyTrackPosition",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.trackService.position,
};
