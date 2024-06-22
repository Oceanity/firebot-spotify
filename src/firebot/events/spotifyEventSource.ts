export const SpotifyEventSource = {
  id: "oceanity-spotify",
  name: "Spotify by Oceanity",
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
      id: "queue-changed",
      name: "Spotify Queue Changed",
      description: "Currently active Spotify Queue has changed",
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
      id: "volume-changed",
      name: "Spotify Volume Changed",
      description:
        "Spotify volume changed, fires faster if volume is changed via Firebot",
      cached: false,
    },
  ],
};
