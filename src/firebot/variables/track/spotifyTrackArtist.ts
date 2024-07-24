import { spotify } from "@/main";
import { chatFeedAlert } from "@/utils/firebot";
import { getTriggerSource } from "@oceanity/firebot-helpers/string";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

let hasAlerted = false;

export const SpotifyTrackArtistVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackArtist",
    description:
      "(Deprecated; use $spotifyTrack[artist]) Gets the primary artist of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackArtist",
    possibleDataOutput: ["text"],
  },
  evaluator: async (trigger: Trigger) => {
    const source = getTriggerSource(trigger);
    if (!hasAlerted) {
      hasAlerted = true;
      chatFeedAlert(
        `Using deprecated variable \`$spotifyTrackArtist\` in ${source}, use \`$spotifyTrack[artist]\` instead.`
      );
    }
    return spotify.player.track.summary?.artist ?? "";
  },
};
