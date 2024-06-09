import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyLyricsCurrentLineVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyLyricsCurrentLine",
    description:
      "Gets the currently playing line of the lyrics of the active Spotify Device",
    usage: "spotifyLyricsCurrentLine",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.BOOLEAN],
  },
  evaluator: async () => spotify.player.lyrics.currentLine,
};
