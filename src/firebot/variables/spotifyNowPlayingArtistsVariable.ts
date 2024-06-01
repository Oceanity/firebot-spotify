import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyNowPlayingArtistsVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyNowPlayingArtists",
    description:
      "Gets all the artists of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyNowPlayingArtists",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.ARRAY],
  },
  async evaluator() {
    try {
      if (!(await spotify.player.isPlayingAsync())) return "";

      const currentlyPlaying = await spotify.player.getCurrentlyPlaying();

      return currentlyPlaying
        ? currentlyPlaying.artists.map((artist) => artist.name)
        : "";
    } catch (error) {
      return "";
    }
  },
};
