import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const RawSpotifyTrackVariable: ReplaceVariable = {
  definition: {
    handle: "rawSpotifyTrack",
    description:
      "Gets an object containing all data returned from the Spotify API about the currently playing track, see [Response Sample](https://developer.spotify.com/documentation/web-api/reference/get-track) for details",
    usage: "rawSpotifyTrack",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track.raw ?? null,
};
