import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackPositionMsVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackPositionMs",
    description:
      "Gets total length of playing track on Spotify as milliseconds or -1 if not playing",
    usage: "spotifyTrackPositionMs",
    possibleDataOutput: ["number"],
  },
  evaluator: async () =>
    spotify.player.track ? spotify.player.track.positionMs : -1,
};
