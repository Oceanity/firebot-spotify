import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackHasLyricsVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackHasLyrics",
    description:
      "Will be `true` if current Spotify track has lyrics opened, `false` if not",
    usage: "spotifyTrackHasLyrics",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.BOOLEAN],
  },
  evaluator: async () => spotify.player.lyrics.trackHasLyrics,
};
