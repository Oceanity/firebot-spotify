import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlaylistVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlaylist",
    description:
      "Gets a summary of the currently playing Spotify playlist, including summaries of contained tracks (up to 20 tracks)",
    usage: "spotifyPlaylist",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.OBJECT],
    examples: [
      {
        usage: "spotifyPlaylist[field]",
        description:
          "Outputs an object with summary of the track in the queue at index 0 (has same fields as $spotifyTrack)",
      },
      {
        usage: "spotifyPlaylist[tracks.0]",
        description:
          "Outputs the track in the playlist at index 0 (has same fields as $spotifyTrack[field])",
      },
    ],
  },
  evaluator: async (_trigger, subject: string = "") => {
    let playlist = spotify.player.playlist.summary ?? null;
    const [key, trackIndex, trackKey] = subject.split(".");

    if (!key) return playlist;
    if (!playlist) return null;
    if (!trackIndex) return playlist[key as keyof SpotifyPlaylistSummary] ?? "";

    const indexNum = Number(trackIndex);

    if (isNaN(indexNum) || indexNum < 0 || indexNum >= playlist.tracks.length)
      return trackKey ? "" : null;

    if (!key) return playlist.tracks[indexNum];

    let track = playlist.tracks[indexNum] as SpotifyTrackSummary;

    return trackKey
      ? track[trackKey as keyof SpotifyTrackSummary] ?? ""
      : track;
  },
};
