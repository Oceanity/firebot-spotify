import { spotify } from "@/main";
import { chatFeedAlert } from "@oceanity/firebot-helpers/firebot"
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { getTriggerSource } from "@oceanity/firebot-helpers/string";

let hasAlerted = false;

export const SpotifyTrackPositionVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackPosition",
    description:
      "(Deprecated; use $spotifyTrack[position]) Gets current position in playing track on Spotify as formatted string or empty string if not playing",
    usage: "spotifyTrackPosition",
    possibleDataOutput: ["text"],
  },
  evaluator: async (trigger: Trigger) => {
    const source = getTriggerSource(trigger);
    if (!hasAlerted) {
      hasAlerted = true;
      chatFeedAlert(
        `Using deprecated variable \`$spotifyTrackPosition\` in ${source}, use \`$spotifyTrack[position]\` instead.`
      );
    }
    return spotify.player.track.position
  }
};
