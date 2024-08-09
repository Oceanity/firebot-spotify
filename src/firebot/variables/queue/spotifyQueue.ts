import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { objectWalkPath } from "@oceanity/firebot-helpers/object";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyQueueVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyQueue",
    description:
      "Gets an array containing the upcoming tracks in the active Spotify queue (up to 20)",
    usage: "spotifyQueue",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.OBJECT],
    examples: [
      {
        usage: "spotifyQueue[0]",
        description:
          "Outputs an object with summary of the track in the queue at index 0",
      },
      {
        usage: "spotifyQueue[0.title]",
        description:
          "Outputs the title of the track in the queue at index 0 (has same fields as $spotifyTrack[])",
      },
    ],
  },
  evaluator: async (_trigger, subject?: string) =>
    objectWalkPath(spotify.player.queue.summary, subject),
};
