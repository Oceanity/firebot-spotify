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
      {
        usage: "spotifyUserQueues[$username, 0]",
        description:
          "Gets the first track queued by the specified user",
      },
      {
        usage: "spotifyUserQueues[0]",
        description:
          "Gets the first track in the user queued tracks list",
      }
    ],
  },

  evaluator: async (_trigger, username?: string, subject?: string) => {
    if (!username) return objectWalkPath(spotify.player.queue.userQueues, subject);

    const subjectRegex = /^(\d+)(\.\S+)*$/;
    let swappedSubject = false;

    // Check if username should be considered subject
    if (!spotify.player.queue.userHasQueuedTracks(username) && !subject && subjectRegex.test(username)) {
      subject = username;
      username = undefined;

      swappedSubject = true;
    }

    let queue = spotify.player.queue.getTracksQueuedByUser(username);

    return objectWalkPath(queue, subject) ?? (!!subject || swappedSubject ? undefined : []);
  },
};
