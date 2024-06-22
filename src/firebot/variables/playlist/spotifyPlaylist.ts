import { spotify } from "@/main";
import { OutputDataType } from "@/shared/variable-constants";
import { ReplaceVariable } from "@crowbartools/firebot-custom-scripts-types/types/modules/replace-variable-manager";

export const SpotifyPlaylistVariable: ReplaceVariable = {
  definition: {
    handle: "spotifyPlaylist",
    description:
      "Gets a specified field of the currently playing Spotify playlist, or the entire object if just called as $spoitfyPlaylist. See examples for all fields.",
    usage: "spotifyPlaylist[field]",
    //@ts-expect-error ts2322
    possibleDataOutput: [OutputDataType.OBJECT],
    examples: [
      {
        usage: "spotifyPlaylist[name]",
        description:
          "Outputs the name of the currently playing Spotify Playlist",
      },
      {
        usage: "spotifyPlaylist[description]",
        description:
          "Outputs the description of the currently playing Spotify Playlist",
      },
      {
        usage: "spotifyPlaylist[tracks]",
        description:
          "Outputs the Description of the currently playing Spotify Playlist)",
      },
      {
        usage: "spotifyPlaylist[tracks.0]",
        description:
          "Outputs an object containing a summary of the track in the playlist at index 0",
      },
      {
        usage: "spotifyPlaylist[tracks.0.title]",
        description:
          "Outputs the title of the track in the playlist at index 0 (has same fields as $spotifyTrack[])",
      },
      {
        usage: "spotifyPlaylist[length]",
        description:
          "Outputs the total number of tracks of the currently playing Spotify Playlist",
      },
      {
        usage: "spotifyPlaylist[coverImageUrl]",
        description:
          "Outputs the url of the cover image of the currently playing Spotify Playlist",
      },
      {
        usage: "spotifyPlaylist[owner]",
        description:
          "Outputs the owner of the currently playing Spotify Playlist",
      },
      {
        usage: "spotifyPlaylist[ownerUrl]",
        description:
          "Outputs the url to the profile of the owner of the currently playing Spotify Playlist)",
      },
      {
        usage: "spotifyPlaylist[url]",
        description:
          "Outputs the shareable url of the currently playing Spotify Playlist)",
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
