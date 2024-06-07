import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlaylistUrlVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlaylistUrl",
    description: "Gets the Url of the currently playing Spotify Playlist",
    usage: "spotifyPlaylistUrl",
    possibleDataOutput: ["number"],
  },
  evaluator: async () => spotify.player.playlist.url,
};
