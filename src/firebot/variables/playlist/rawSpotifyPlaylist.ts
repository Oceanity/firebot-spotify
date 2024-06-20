import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const RawSpotifyPlaylistVariable: ReplaceVariable = {
  definition: {
    handle: "rawSpotifyPlaylist",
    description:
      "Gets an object containing all data returned from the Spotify API about the currently playing playlist",
    usage: "rawSpotifyPlaylist",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.BOOLEAN],
  },
  evaluator: async () => spotify.player.playlist.raw,
};
