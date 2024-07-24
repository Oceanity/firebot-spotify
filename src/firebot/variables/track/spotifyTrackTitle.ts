import { spotify } from "@/main";
import { chatFeedAlert } from "@/utils/firebot";
import { getTriggerSource } from "@oceanity/firebot-helpers/string";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

let hasAlerted = false;

export const SpotifyTrackTitleVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackTitle",
    description:
      "(Deprecated; use $spotifyTrack[title]) Gets the title of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackTitle",
    possibleDataOutput: ["text"],
  },
  evaluator: async (trigger: Trigger) => {
    const source = getTriggerSource(trigger);
    if (!hasAlerted) {
      hasAlerted = true;
      chatFeedAlert(
        `Using deprecated variable \`$spotifyTrackTitle\` in ${source}, use \`$spotifyTrack[title]\` instead.`
      );
    }
    return spotify.player.track.summary?.title ?? "";
  },
};
