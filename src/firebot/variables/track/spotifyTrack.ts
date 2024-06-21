import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrack",
    description:
      "Gets an object containing information about the currently playing track",
    usage: "spotifyTrack[field]",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.OBJECT],
    examples: [
      {
        usage: "spotifyTrack[title]",
        description: "Outputs the title of the currently playing Spotify track",
      },
      {
        usage: "spotifyTrack[artist]",
        description:
          "Outputs the primary artist of the currently playing Spotify track",
      },
      {
        usage: "spotifyTrack[artists]",
        description:
          "Outputs an array of artists of the currently playing Spotify track",
      },
      {
        usage: "spotifyTrack[album]",
        description:
          "Outputs the album name of the currently playing Spotify track",
      },
      {
        usage: "spotifyTrack[albumArtUrl]",
        description:
          "Outputs the url of the album art of the currently playing Spotify track",
      },
    ],
  },
  evaluator: async (_trigger, subject: string) => {
    let track = spotify.player.track.summary ?? null;

    if (!subject) return track;
    if (!track) return "";

    return track[subject as keyof SpotifyTrackSummaryWithPosition] ?? "";
  },
};
