import { SPOTIFY_INTEGRATION_ID, SPOTIFY_INTEGRATION_NAME } from "@/constants";

export const SpotifyEventSource = {
  id: SPOTIFY_INTEGRATION_ID,
  name: SPOTIFY_INTEGRATION_NAME,
  description: "Events related to Oceanity's Spotify integration",
  events: [
    {
      id: "lyrics-changed",
      name: "Spotify Lyrics Changed",
      description: "Current Spotify lyrics line changed",
      cached: false,
    },
    {
      id: "playback-state-changed",
      name: "Spotify Playback State Changed",
      description: "Spotify playback state changed",
      cached: false,
    },
    {
      id: "playlist-changed",
      name: "Spotify Playlist Changed",
      description: "Currently active Spotify Playlist has changed",
      cached: false,
    },
    {
      id: "tick",
      name: "Spotify Tick",
      description:
        "Fired around once per second after current playback state has been updated",
      cached: false,
    },
    {
      id: "track-changed",
      name: "Spotify Track Changed",
      description: "Currently playing Spotify track changed",
      cached: false,
    },
    {
      id: "track-auto-skipped",
      name: "Spotify Track Auto-Skipped",
      description: "Spotify track was auto-skipped",
      cached: false,
    },
    {
      id: "volume-changed",
      name: "Spotify Volume Changed",
      description:
        "Spotify volume changed, fires faster if volume is changed via Firebot",
      cached: false,
    },
  ],
};
