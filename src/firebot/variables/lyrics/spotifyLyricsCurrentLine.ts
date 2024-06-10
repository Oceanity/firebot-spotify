import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyLyricsCurrentLineVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyLyricsCurrentLine",
    description:
      "Gets the currently playing line of the lyrics of the active Spotify Device",
    usage: "spotifyLyricsCurrentLine",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.lyrics.currentLine,
};
