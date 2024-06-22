import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackDurationVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackDuration",
    description:
      "(Deprecated; use $spotifyTrack[duration]) Gets total length of playing track on Spotify as formatted string or empty string if not playing",
    usage: "spotifyTrackDuration",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track.duration,
};
