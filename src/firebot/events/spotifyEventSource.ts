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
      activityFeed: {
        icon: "fab fa-spotify",
        getMessage: () => "Spotify lyrics changed",
      },
    },
    {
      id: "playback-state-changed",
      name: "Spotify Playback State Changed",
      description: "Spotify playback state changed",
      cached: false,
      activityFeed: {
        icon: "fab fa-spotify",
        getMessage: () => "Spotify playback state changed",
      },
    },
    {
      id: "playlist-changed",
      name: "Spotify Playlist Changed",
      description: "Currently active Spotify Playlist has changed",
      cached: false,
      activityFeed: {
        icon: "fab fa-spotify",
        getMessage: () => "Spotify playlist changed",
      },
    },
    {
      id: "tick",
      name: "Spotify Tick",
      description:
        "Fired around once per second after current playback state has been updated",
      cached: false,
      activityFeed: {
        icon: "fab fa-spotify",
        getMessage: () => "Spotify tick",
      },
    },
    {
      id: "track-changed",
      name: "Spotify Track Changed",
      description: "Currently playing Spotify track changed",
      cached: false,
      activityFeed: {
        icon: "fab fa-spotify",
        getMessage: () => "Spotify track changed",
      },
    },
    {
      id: "volume-changed",
      name: "Spotify Volume Changed",
      description:
        "Spotify volume changed, fires faster if volume is changed via Firebot",
      cached: false,
      activityFeed: {
        icon: "fab fa-spotify",
        getMessage: () => "Spotify volume changed",
      },
    },
  ],
};
