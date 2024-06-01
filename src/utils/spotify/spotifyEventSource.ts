export const SpotifyEventSource = {
  id: "oceanity-spotify",
  name: "Spotify by Oceanity",
  description: "Events related to Oceanity's Spotify integration",
  events: [
    {
      id: "track-changed",
      name: "Track Changed",
      description: "Currently playing Spotify track changed",
      cached: false,
      activityFeed: {
        icon: "fab fa-spotify",
        getMessage: () => "Spotify track changed",
      },
    },
  ],
};
