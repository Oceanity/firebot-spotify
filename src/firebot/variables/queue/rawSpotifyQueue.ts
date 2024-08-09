import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { objectWalkPath } from "@oceanity/firebot-helpers/object";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { logger } from "@oceanity/firebot-helpers/firebot";

export const RawSpotifyQueueVariable: ReplaceVariable = {
  definition: {
    handle: "rawSpotifyQueue",
    description:
      "Gets an object containing all data returned from the Spotify API about the currently playing queue, see [Response Sample](https://developer.spotify.com/documentation/web-api/reference/get-queue) for details",
    usage: "rawSpotifyQueue",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.OBJECT],
  },
  evaluator: async (_trigger, subject?: string) => {
    try {
      const queue = await spotify.player.queue.getAsync();

      let value = objectWalkPath(queue, subject) ?? "";

      return value;
    } catch (e) {
      return "";
    }
  }
};
