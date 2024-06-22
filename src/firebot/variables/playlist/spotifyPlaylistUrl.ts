import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlaylistUrlVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlaylistUrl",
    description:
      "(Deprecated; use $spotifyPlaylist[url]) Gets the Url of the currently playing Spotify Playlist",
    usage: "spotifyPlaylistUrl",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.playlist.url,
};
