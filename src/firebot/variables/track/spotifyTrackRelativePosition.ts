import { spotify } from "@/main";
import { chatFeedAlert } from "@/utils/firebot";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { getTriggerSource } from "@oceanity/firebot-helpers/string";

let hasAlerted = false;

export const SpotifyTrackRelativePositionVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackRelativePosition",
    description:
      "(Deprecated; use $spotifyTrack[relativePosition]). Gets current position in playing track on Spotify as a value from 0.0 to 1.0, or -1 if not playing",
    usage: "spotifyTrackRelativePosition",
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
    return spotify.player.track.relativePosition;
  }
};
