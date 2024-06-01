import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyIsPlayingVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyIsPlaying",
    description:
      "Will be `true` if Spotify is currently playing, `false` if not",
    usage: "spotifyIsPlaying",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.BOOLEAN],
  },
  async evaluator() {
    try {
      return await spotify.player.isPlayingAsync();
    } catch (error) {
      return false;
    }
  },
};
