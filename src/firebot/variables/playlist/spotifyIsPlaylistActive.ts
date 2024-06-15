import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyIsPlaylistActiveVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyIsPlaylistActive",
    description: "Will be `true` if Spotify has playlist open, `false` if not",
    usage: "spotifyIsPlaylistActive",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.BOOLEAN],
  },
  evaluator: async () => spotify.player.playlist.isActive,
};
