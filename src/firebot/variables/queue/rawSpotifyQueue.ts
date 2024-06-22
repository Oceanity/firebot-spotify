import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const RawSpotifyQueueVariable: ReplaceVariable = {
  definition: {
    handle: "rawSpotifyQueue",
    description:
      "Gets an object containing all data returned from the Spotify API about the currently playing queue, see [Response Sample](https://developer.spotify.com/documentation/web-api/reference/get-queue) for details",
    usage: "rawSpotifyQueue",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.OBJECT],
  },
  evaluator: async () => spotify.player.queue.raw ?? null,
};
