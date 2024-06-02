import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyNowPlayingDurationVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyNowPlayingDuration",
    description:
      "Gets total length of playing track on Spotify as formatted string or empty string if not playing",
    usage: "spotifyNowPlayingDuration",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track?.duration ?? "",
};
