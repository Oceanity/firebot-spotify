import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlaylistDescriptionVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlaylistDescription",
    description:
      "Gets the Description of the currently playing Spotify Playlist",
    usage: "spotifyPlaylistDescription",
    possibleDataOutput: ["number"],
  },
  evaluator: async () => spotify.player.playlist.description,
};