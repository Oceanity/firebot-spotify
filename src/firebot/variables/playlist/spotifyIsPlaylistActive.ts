import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyIsPlaylistActiveVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyIsPlaylistActive",
    description: "Will be `true` if Spotify has playlist open, `false` if not",
    usage: "spotifyIsPlaylistActive",
    possibleDataOutput: ["number"],
  },
  evaluator: async () => spotify.player.playlist.isPlaylistActive,
};
