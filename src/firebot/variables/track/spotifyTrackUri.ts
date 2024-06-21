import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackUriVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackUri",
    description:
      "DEPRECATED, use $spotifyTrack[uri]. Gets the unique Uri of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackUri",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track.uri,
};
