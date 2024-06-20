import { spotify } from "@/main";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackArtistVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrackArtist",
    description:
      "DEPRECATED, use $spotifyTrack[artist]. Gets the primary artist of the currently playing track on Spotify or empty string if not playing",
    usage: "spotifyTrackArtist",
    possibleDataOutput: ["text"],
  },
  evaluator: async () => spotify.player.track.summary?.artist ?? "",
};
