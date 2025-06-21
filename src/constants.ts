import * as packageJson from "../package.json";
import { SpotifyEvent } from "./types";

//#region Integration constants

export const {
  name: SPOTIFY_INTEGRATION_ID,
  displayName: SPOTIFY_INTEGRATION_NAME,
  description: SPOTIFY_INTEGRATION_DESCRIPTION,
  author: SPOTIFY_INTEGRATION_AUTHOR,
  version: SPOTIFY_INTEGRATION_VERSION,
} = packageJson;

export const SPOTIFY_INTEGRATION_FIREBOT_VERSION = "5";

export const SPOTIFY_EVENT_SOURCE = {
  id: SPOTIFY_INTEGRATION_ID,
  name: SPOTIFY_INTEGRATION_NAME,
  description: "Events related to Oceanity's Spotify integration",
  events: [
    {
      id: SpotifyEvent.LyricsChanged,
      name: "Spotify Lyrics Changed",
      description: "Current Spotify lyrics line changed",
      cached: false,
    },
    {
      id: SpotifyEvent.PlaybackStateChanged,
      name: "Spotify Playback State Changed",
      description: "Spotify playback state changed",
      cached: false,
    },
    {
      id: SpotifyEvent.PlaylistChanged,
      name: "Spotify Playlist Changed",
      description: "Currently active Spotify Playlist has changed",
      cached: false,
    },
    {
      id: SpotifyEvent.Tick,
      name: "Spotify Tick",
      description:
        "Fired around once per second after current playback state has been updated",
      cached: false,
    },
    {
      id: SpotifyEvent.TrackChanged,
      name: "Spotify Track Changed",
      description: "Currently playing Spotify track changed",
      cached: false,
    },
    {
      id: SpotifyEvent.TrackAutoSkipped,
      name: "Spotify Track Auto-Skipped",
      description: "Spotify track was auto-skipped",
      cached: false,
    },
    {
      id: SpotifyEvent.VolumeChanged,
      name: "Spotify Volume Changed",
      description:
        "Spotify volume changed, fires faster if volume is changed via Firebot",
      cached: false,
    },
  ],
};

//#endregion

//#region Spotify API constants

export const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "app-remote-control",
  "streaming",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-email",
  "user-read-playback-position",
  "user-read-playback-state",
  "user-read-private",
  "user-read-recently-played",
];

//#endregion
