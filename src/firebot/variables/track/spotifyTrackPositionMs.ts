import { spotify } from "@/main";
import { chatFeedAlert } from "@/utils/firebot";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { getTriggerSource } from "@oceanity/firebot-helpers/string";

let hasAlerted = false;

export const SpotifyTrackPositionMsVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackPositionMs",
    description:
      "(Deprecated; use $spotifyTrack[positionMs]) Gets total length of playing track on Spotify as milliseconds or -1 if not playing",
    usage: "spotifyTrackPositionMs",
    possibleDataOutput: ["number"],
  },
  evaluator: async (trigger: Trigger) => {
    const source = getTriggerSource(trigger);
    if (!hasAlerted) {
      hasAlerted = true;
      chatFeedAlert(
        `Using deprecated variable \`$spotifyTrackRelativePosition\` in ${source}, use \`$spotifyTrack[relativePosition]\` instead.`
      );
    }
    return spotify.player.track.positionMs
  }
};
