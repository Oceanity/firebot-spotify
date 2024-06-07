import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlaylistNameVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlaylistName",
    description: "Gets the Name of the currently playing Spotify Playlist",
    usage: "spotifyPlaylistName",
    possibleDataOutput: ["number"],
  },
  evaluator: async () => spotify.player.playlist.name,
};
