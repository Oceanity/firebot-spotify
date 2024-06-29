import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { chatFeedAlert } from "@/utils/firebot";
import { getTriggerSource } from "@/utils/string";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

let hasAlerted = false;

export const SpotifyTrackArtistsVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackArtists",
    description:
      "(Deprecated; use $spotifyTrack[artists]) Gets all the artists of the currently playing track on Spotify as array or empty array if not playing",
    usage: "spotifyTrackArtists",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.ARRAY],
  },
  evaluator: async (trigger: Trigger) => {
    const source = getTriggerSource(trigger);
    if (!hasAlerted) {
      hasAlerted = true;
      chatFeedAlert(
        `Using deprecated variable \`$spotifyTrackArtists\` in ${source}, use \`$spotifyTrack[artists]\` instead.`
      );
    }
    return spotify.player.track.summary?.artists ?? [];
  },
};
