import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlaylistLengthVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlaylistLength",
    description: "Gets the Length of the currently playing Spotify Playlist",
    usage: "spotifyPlaylistLength",
    possibleDataOutput: ["number"],
  },
  evaluator: async () => spotify.player.playlist.length,
};
