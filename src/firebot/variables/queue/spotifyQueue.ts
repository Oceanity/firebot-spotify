import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { SpotifyTrackSummary } from "@utils/spotify/player/track";

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
          "Outputs an object with summary of the track in the queue at index 0 (has same fields as $spotifyTrack)",
      },
      {
        usage: "spotifyQueue[0.field]",
        description:
          "Outputs the field of the track in the queue at index 0 (has same fields as $spotifyTrack[field])",
      },
    ],
  },
  evaluator: async (_trigger, subject: string) => {
    let queue = spotify.player.queue.summary ?? [];

    if (!subject) return queue;

    let indexNum = Number(subject);

    if (!isNaN(indexNum) && indexNum >= 0 && indexNum < queue.length) {
      return queue[indexNum];
    }

    if (subject.indexOf(".") !== -1) {
      const [index, key] = subject.split(".");

      indexNum = Number(index);

      if (!isNaN(indexNum) && indexNum >= 0 && indexNum < queue.length) {
        const currentSummary = queue[indexNum];
        let summaryKey = key as keyof SpotifyTrackSummary;
        return currentSummary.hasOwnProperty(summaryKey)
          ? currentSummary[summaryKey]
          : "";
      }
    }

    return "";
  },
};
