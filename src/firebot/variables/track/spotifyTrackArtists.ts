import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackArtistsVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackArtists",
    description:
      "Gets all the artists of the currently playing track on Spotify as array or empty array if not playing",
    usage: "spotifyTrackArtists",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.ARRAY],
  },
  evaluator: async () => spotify.player.trackService.artists,
};
