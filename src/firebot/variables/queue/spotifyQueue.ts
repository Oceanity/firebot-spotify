import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
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
  evaluator: async (_trigger, subject: string = "") => {
    let queue = spotify.player.queue.summary ?? [];
    const [index, key] = subject.split(".");

    if (!index) return queue;

    let indexNum = Number(index);
    if (isNaN(indexNum) || indexNum < 0 || indexNum >= queue.length)
      return key ? "" : null;

    let track = queue[indexNum] as SpotifyTrackSummary;
    return key ? track[key as keyof SpotifyTrackSummary] ?? "" : track;
  },
};
