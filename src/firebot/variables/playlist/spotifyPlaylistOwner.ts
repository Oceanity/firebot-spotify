import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlaylistOwnerVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlaylistOwner",
    description:
      "(Deprecated; use $spotifyPlaylist[owner]) Gets the Owner of the currently playing Spotify Playlist",
    usage: "spotifyPlaylistOwner",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.playlist.owner,
};
