export const emptySearchCategory = <T>(): SpotifySearchCategory<T> => ({
  href: "",
  limit: 1,
  next: "",
  offset: 0,
  previous: "",
  total: 0,
  items: [],
});

export const testSearchResponse = {
  tracks: emptySearchCategory<SpotifyTrackDetails>(),
  artists: emptySearchCategory<SpotifyArtistDetails>(),
  albums: emptySearchCategory<SpotifyAlbumDetails>(),
  audiobooks: emptySearchCategory<SpotifyAudiobookDetails>(),
  playlists: emptySearchCategory<SpotifyPlaylistDetails>(),
  shows: emptySearchCategory<SpotifyShowDetails>(),
  episodes: emptySearchCategory<SpotifyEpisodeDetails>(),
};

export const testTrack: SpotifyTrackDetails = {
  album: {
    album_type: "album",
    artists: [],
    available_markets: [],
    external_urls: {
      spotify: "",
    },
    href: "",
    id: "",
    images: [],
    name: "",
    release_date: "",
    release_date_precision: "",
    restrictions: {},
    type: "album",
    uri: "",
    total_tracks: 0,
  },
  artists: [],
  available_markets: [],
  disc_number: 1,
  duration_ms: 0,
  explicit: false,
  external_ids: {
    isrc: "",
  },
  external_urls: {
    spotify: "",
  },
  href: "",
  id: "",
  is_local: false,
  name: "",
  popularity: 0,
  preview_url: "",
  track_number: 1,
  type: "track",
  uri: "",
  is_playable: false,
  restrictions: {
    reason: "",
  },
  linked_from: {
    href: "",
    id: "",
    type: "",
    uri: "",
  },
};

export const testPlaylist: SpotifyPlaylistDetails = {
  collaborative: false,
  description: "my cool playlist",
  external_urls: {
    spotify: "spotify-url",
  },
  primary_color: "#00bcc5",
  href: "playlist-url",
  id: "playlist-id",
  images: [
    {
      url: "big-image.jpg",
      height: 500,
      width: 500,
    },
    {
      url: "small-image.jpg",
      height: 100,
      width: 100,
    },
  ],
  name: "some playlist",
  owner: {
    display_name: "Oceanity",
    external_urls: {
      spotify: "https://open.spotify.com/user/oceanity",
    },
    href: "https://twitch.tv/oceanity",
    id: "oceanity",
    uri: "that:bird:oceanity",
    country: "US",
    product: "github",
    followers: {
      href: "",
      total: 9001,
    },
    email: "",
    explicit_content: {
      filter_enabled: false,
      filter_locked: false,
    },
    type: "user",
    images: [],
  },
  public: false,
  snapshot_id: "",
  tracks: emptySearchCategory<SpotifyTrackDetails>(),
  type: "playlist",
  uri: "playlist-uri",
};
