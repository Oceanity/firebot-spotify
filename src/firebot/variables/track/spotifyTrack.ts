import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyTrackVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyTrack",
    description:
      "Gets a specified field of the currently playing Spotify track, or the entire object if just called as $spoitfyTrack. See examples for all fields.",
    usage: "spotifyTrack[field]",
    //@ts-ignore
    possibleDataOutput: [OutputDataType.OBJECT, OutputDataType.TEXT],
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
      {
        usage: "spotifyTrack[duration]",
        description:
          "Outputs the duration of the currently playing Spotify track formatted as hh:mm:ss",
      },
      {
        usage: "spotifyTrack[durationMs]",
        description:
          "Outputs the duration of the currently playing Spotify track in milliseconds",
      },
      {
        usage: "spotifyTrack[position]",
        description:
          "Outputs the position of the currently playing Spotify track formatted as hh:mm:ss",
      },
      {
        usage: "spotifyTrack[positionMs]",
        description:
          "Outputs the position of the currently playing Spotify track in milliseconds",
      },
      {
        usage: "spotifyTrack[relativePosition]",
        description:
          "Outputs the relative position of the currently playing Spotify track as a value from 0.0 to 1.0 inclusive",
      },
      {
        usage: "spotifyTrack[url]",
        description: "Outputs the url of the currently playing Spotify track",
      },
      {
        usage: "spotifyTrack[uri]",
        description: "Outputs the uri of the currently playing Spotify track",
      },
      {
        usage: "spotifyTrack[queuedBy]",
        description:
          "Outputs the username of the user who queued the current track on Spotify",
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
