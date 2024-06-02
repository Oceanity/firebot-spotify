import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyNowPlayingPositionVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyNowPlayingPosition",
    description:
      "Gets current position in playing track on Spotify as formatted string or empty string if not playing",
    usage: "spotifyNowPlayingPosition",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track?.position ?? "",
};
