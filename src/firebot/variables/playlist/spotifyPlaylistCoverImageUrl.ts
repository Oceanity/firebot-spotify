import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlaylistCoverImageUrlVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlaylistCoverImageUrl",
    description:
      "Gets the Cover Image Url of the currently playing Spotify Playlist",
    usage: "spotifyPlaylistCoverImageUrl",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.playlist.coverImageUrl,
};
