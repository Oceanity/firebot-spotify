import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { objectWalkPath } from "@oceanity/firebot-helpers/object";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const RawSpotifyPlaylistVariable: ReplaceVariable = {
  definition: {
    handle: "rawSpotifyPlaylist",
    description:
      "Gets an object containing all data returned from the Spotify API about the currently playing playlist, see [Response Sample](https://developer.spotify.com/documentation/web-api/reference/get-playlist) for detail",
    usage: "rawSpotifyPlaylist",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.BOOLEAN],
  },
  evaluator: async (_trigger, subject: string = "") =>
    objectWalkPath(spotify.player.playlist.raw, subject),
};
