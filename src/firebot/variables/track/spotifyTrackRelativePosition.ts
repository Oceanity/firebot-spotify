import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackRelativePositionVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackRelativePosition",
    description:
      "Gets current position in playing track on Spotify as a value from 0.0 to 1.0, or -1 if not playing",
    usage: "spotifyTrackRelativePosition",
    possibleDataOutput: ["number"],
  },
  evaluator: async () => spotify.player.track.relativePosition,
};
