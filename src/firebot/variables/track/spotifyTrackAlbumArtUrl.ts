import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackAlbumArtUrlVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackAlbumArtUrl",
    description:
      "(Deprecated; use $spotifyTrack[albumArtUrl]) Gets the album art url of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackAlbumArtUrl",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track.summary?.albumArtUrl ?? "",
};
