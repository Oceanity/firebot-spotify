import { spotify } from "@/main";
import { chatFeedAlert } from "@/utils/firebot";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { getTriggerSource } from "@oceanity/firebot-helpers/string";

let hasAlerted = false;

export const SpotifyTrackIdVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackId",
    description:
      "(Deprecated; use $spotifyTrack[id]) Gets the Id of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackId",
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
    return spotify.player.track.id
  }
};
