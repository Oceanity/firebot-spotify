import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlayerRelativeVolumeVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlayerRelativeVolume",
    description:
      "Gets the relative volume of the active Spotify Device as a value from 0.0 to 1.0",
    usage: "spotifyPlayerRelativeVolume",
    possibleDataOutput: ["number"],
  },
  evaluator: async () => spotify.player.volume / 100,
};
