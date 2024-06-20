import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackTitleVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackTitle",
    description:
      "DEPRECATED, use $spotifyTrack[title]. Gets the title of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackTitle",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track.summary?.title ?? "",
};
