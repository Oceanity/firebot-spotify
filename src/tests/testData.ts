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
