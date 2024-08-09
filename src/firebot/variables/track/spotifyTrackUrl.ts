import { spotify } from "@/main";
import { chatFeedAlert } from "@oceanity/firebot-helpers/firebot"
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";
import { getTriggerSource } from "@oceanity/firebot-helpers/string";

let hasAlerted = false;

export const SpotifyTrackUrlVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackUrl",
    description:
      "(Deprecated; use $spotifyTrack[url]) Gets the shareable Url of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackUrl",
    possibleDataOutput: ["text"],
  },
  evaluator: async (trigger: Trigger) => {
    const source = getTriggerSource(trigger);
    if (!hasAlerted) {
      hasAlerted = true;
      chatFeedAlert(
        `Using deprecated variable \`$spotifyTrackUrl\` in ${source}, use \`$spotifyTrack[url]\` instead.`
      );
    }
    return spotify.player.track.url
  }
};
