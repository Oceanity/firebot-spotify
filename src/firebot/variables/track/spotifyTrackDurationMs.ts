import { spotify } from "@/main";
import { chatFeedAlert } from "@/utils/firebot";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { getTriggerSource } from "@oceanity/firebot-helpers/string";

let hasAlerted = false;

export const SpotifyTrackDurationMsVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackDurationMs",
    description:
      "(Deprecated; use $spotifyTrack[durationMs]) Gets total length of playing track on Spotify as milliseconds or -1 if not playing",
    usage: "spotifyTrackDurationMs",
    possibleDataOutput: ["number"],
  },
  evaluator: async (trigger: Trigger) => {
    const source = getTriggerSource(trigger);
    if (!hasAlerted) {
      hasAlerted = true;
      chatFeedAlert(
        `Using deprecated variable \`$spotifyTrackPosition\` in ${source}, use \`$spotifyTrack[position]\` instead.`
      );
    }
    return spotify.player.track.durationMs
  }
};
