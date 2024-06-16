import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlaylistOwnerUrlVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlaylistOwnerUrl",
    description:
      "Gets the Spotify Profile URL to the Owner of the currently playing Spotify Playlist",
    usage: "spotifyPlaylistOwnerUrl",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.playlist.owner,
};
