import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlayerVolumeVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlayerVolume",
    description: "Gets the volume of the active Spotify device",
    usage: "spotifyPlayerVolume",
    possibleDataOutput: ["number"],
  },
  evaluator: async () => spotify.player.volume,
};
