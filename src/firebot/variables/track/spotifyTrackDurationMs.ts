import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackDurationMsVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackDurationMs",
    description:
      "(Deprecated; use $spotifyTrack[durationMs]) Gets total length of playing track on Spotify as milliseconds or -1 if not playing",
    usage: "spotifyTrackDurationMs",
    possibleDataOutput: ["number"],
  },
  evaluator: async () => spotify.player.track.durationMs,
};
