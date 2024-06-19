import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyRawTrackVariable: ReplaceVariable = {
  definition: {
    handle: "rawSpotifyTrack",
    description:
      "Gets an object containing all data returned from the Spotify API about the currently playing track",
    usage: "rawSpotifyTrack",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track.raw,
};
