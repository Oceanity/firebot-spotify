import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { objectWalkPath } from "@oceanity/firebot-helpers/object";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyUserQueuesVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyUserQueues",
    description:
      "Gets an array containing the tracks queued by the users, or by a specified user)",
    usage: "spotifyUserQueues",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.OBJECT],
    examples: [
      {
        usage: "spotifyUserQueues[$username]",
        description:
          "Gets an array containing the tracks queued by the specified user",
      },
    ],
  },

  evaluator: async (_trigger, username: string = "", subject: string = "") => {
    let queue = spotify.player.queue.getTracksQueuedByUser(username);

    return objectWalkPath(queue, subject);
  },
};
