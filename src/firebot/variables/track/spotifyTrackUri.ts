import { spotify } from "@/main";
import { chatFeedAlert } from "@oceanity/firebot-helpers/firebot"
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { getTriggerSource } from "@oceanity/firebot-helpers/string";

let hasAlerted = false;

export const SpotifyTrackUriVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackUri",
    description:
      "(Deprecated; use $spotifyTrack[uri]) Gets the unique Uri of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackUri",
    possibleDataOutput: ["text"],
  },
  evaluator: async (trigger: Trigger) => {
    const source = getTriggerSource(trigger);
    if (!hasAlerted) {
      hasAlerted = true;
      chatFeedAlert(
        `Using deprecated variable \`$spotifyTrackUri\` in ${source}, use \`$spotifyTrack[uri]\` instead.`
      );
    }
    return spotify.player.track.uri
  }
};
