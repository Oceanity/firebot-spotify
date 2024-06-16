import { SpotifyQueueService } from "./utils/spotify/player/queue";

export const emptySearchCategory = <T>(): SpotifySearchCategory<T> => ({
  href: "",
  limit: 1,
  next: "",
  offset: 0,
  previous: "",
  total: 0,
  items: [],
});

export const testImages: SpotifyImage[] = [
  {
    url: "medium-image.jpg",
    height: 300,
    width: 300,
  },
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
];

export const testSearchResponse = {
  tracks: emptySearchCategory<SpotifyTrackDetails>(),
  artists: emptySearchCategory<SpotifyArtistDetails>(),
  albums: emptySearchCategory<SpotifyAlbumDetails>(),
  audiobooks: emptySearchCategory<SpotifyAudiobookDetails>(),
  playlists: emptySearchCategory<SpotifyPlaylistDetails>(),
  shows: emptySearchCategory<SpotifyShowDetails>(),
  episodes: emptySearchCategory<SpotifyEpisodeDetails>(),
};

const testArtist: SpotifyArtistDetails = {
  name: "",
  genres: [],
  followers: {
    href: "",
    total: 0,
  },
  images: testImages,
  popularity: 0,
  external_urls: {
    spotify: "",
  },
  id: "",
  type: "artist",
  uri: "",
  href: "",
};

export const getTestArtist = (
  name: string = "some artist",
  id: string = "123"
): SpotifyArtistDetails => ({
  ...testArtist,
  name,
  id,
});

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
    images: testImages,
    name: "",
    release_date: "",
    release_date_precision: "",
    restrictions: {},
    type: "album",
    uri: "",
    total_tracks: 0,
  },
  artists: [
    getTestArtist("really important artist"),
    getTestArtist("not so important artist"),
  ],
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

export const getTestTrack = (
  name: string = "some track",
  id: string = "123"
): SpotifyTrackDetails => ({
  ...testTrack,
  name,
  id,
  uri: `spotify:track:${id}`,
});

export const testPlaylist: SpotifyPlaylistDetails = {
  collaborative: false,
  description: "my cool playlist",
  external_urls: {
    spotify: "spotify-url",
  },
  primary_color: "#00bcc5",
  href: "playlist-url",
  id: "playlist-id",
  images: testImages,
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
    images: testImages,
  },
  public: false,
  snapshot_id: "",
  tracks: emptySearchCategory<SpotifyTrackDetails>(),
  type: "playlist",
  uri: "playlist-uri",
};

export const testQueue: SpotifyQueueResponse = {
  currently_playing: getTestTrack("currently playing track", "89072134"),
  queue: [
    getTestTrack("first queued track", "253345512359"),
    getTestTrack("second queued track", "12314356752498"),
    getTestTrack("second queued track", "173358134545"),
  ],
};

export const testLyricData: LyricsData = {
  lyrics: {
    syncType: "LINE_SYNCED",
    lines: [
      {
        startTimeMs: "230",
        words: "Somebody once told me",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "2730",
        words: "The world is gonna roll me",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "5240",
        words: "I ain't the sharpest tool in the shed",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "9370",
        words: "She was looking kind of dumb",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "11850",
        words: "With her finger and her thumb",
        syllables: [],
        endTimeMs: "0",
      },
      {
        startTimeMs: "14190",
        words: 'In the shape of an "L" on her forehead',
        syllables: [],
        endTimeMs: "0",
      },
    ],
    provider: "MusixMatch",
    providerLyricsId: "86149",
    providerDisplayName: "Musixmatch",
    syncLyricsUri: "",
    isDenseTypeface: false,
    alternatives: [],
    language: "en",
    isRtlLanguage: false,
    showUpsell: false,
    capStatus: "NONE",
  },
  colors: { background: -7712260, text: -16777216, highlightText: -1 },
  hasVocalRemoval: false,
};

export const testUser: SpotifyUserProfile = {
  display_name: "Oceanity",
  email: "birdwithgoggles@test.com",
  external_urls: {
    spotify: "https://open.spotify.com/user/oceanity",
  },
  followers: {
    href: "",
    total: 9001,
  },
  href: "https://twitch.tv/oceanity",
  id: "oceanity",
  images: testImages,
  product: "premium",
  type: "user",
  uri: "spotify:user:oceanity",
  country: "US",
  explicit_content: {
    filter_enabled: false,
    filter_locked: false,
  },
};
