//#region Unique Vars
type SpotifyRepeatState = "track" | "context" | "off";

type SpotifyContextType =
  | "album"
  | "artist"
  | "playlist"
  | "track"
  | "show"
  | "episode"
  | "audiobook";

type SpotifyExternalUrls = { spotify: string };

type SpotifyContext = {
  external_urls: SpotifyExternalUrls;
  href: string;
  type: SpotifyContextType;
  uri: string;
} | null;
//#endregion

type SpotifyRefreshTokenResponse = {
  access_token: string;
  token_type: SpotifyContextType;
  scope: string;
  expires_in: number;
  refresh_token: string;
};

type SpotifyUserProfile = {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
    filter_enabled: boolean;
    filter_locked: boolean;
  };
  external_urls: SpotifyExternalUrls;
  followers: {
    href: string;
    total: number;
  };
  href: string;
  id: string;
  images: SpotifyImage[];
  product: string;
  type: string;
  uri: string;
};

type SpotifyGetDevicesResponse = {
  devices: SpotifyDevice[];
};

type SpotifyPlayer = {
  device: SpotifyDevice;
  shuffle_state: boolean;
  smart_shuffle: boolean;
  repeat_state: SpotifyRepeatState;
  timestamp: number;
  context: SpotifyContext;
  progress_ms: number;
  item: SpotifyTrackDetails;
  currently_playing_type: SpotifyContextType;
  actions: {
    disallows: {
      resuming?: boolean;
      skipping_prev?: boolean;
      pausing?: boolean;
      seeking?: boolean;
      skipping_next?: boolean;
      pausing?: boolean;
    };
  };
  is_playing: true;
};

type SpotifyDevice = {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: SpotifyContextType;
  supports_volume: boolean;
  volume_percent: number;
};

type SpotifyImage = {
  url: string;
  height: number;
  width: number;
};

type SpotifyQueueResponse = {
  currently_playing: SpotifyTrackDetails;
  queue: SpotifyTrackDetails[];
};

type FindAndEnqueueTrackResponse = {
  success: boolean;
  data: SpotifyTrackDetails | string;
};

type SpotifyCurrentlyPlaying = {
  device: SpotifyDevice;
  repeat_state: SpotifyRepeatState;
  shuffle_state: boolean;
  context: SpotifyContext;
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyTrackDetails;
  currently_playing_type: SpotifyContextType;
  actions: {
    interrupting_playback?: boolean;
    pausing?: boolean;
    resuming?: boolean;
    seeking?: boolean;
    skipping_prev?: boolean;
    skipping_next?: boolean;
    toggling_repeat?: boolean;
    toggling_shuffle?: boolean;
    toggling_repeat_context?: boolean;
    transferring_playback?: boolean;
  };
};

type SpotifyPlaylistDetails = {
  collaborative: boolean;
  description: string;
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  owner: SpotifyUserProfile;
  primary_color: string | null;
  public: boolean;
  snapshot_id: string;
  tracks: SpotifySearchCategory<SpotifyPlaylistEntry>;
  type: SpotifyContextType;
  uri: string;
};

type SpotifyPlaylistSummary = {
  id: string;
  name: string;
  description: string;
  coverImageUrl: string;
  owner: SpotifyUserProfile;
  isPublic: boolean;
  tracks: SpotifyTrackSummary[];
  url: string;
  uri: string;
  length: number;
};

type SpotifyAddedBy = {
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  type: string;
  uri: string;
};

type SpotifyPlaylistEntry = {
  added_at: string;
  added_by: AddedBy;
  is_local: boolean;
  primary_color: string | null;
  track: SpotifyTrackDetails;
  video_thumbnail: VideoThumbnail;
};

//#region Spotify API /search types
type SpotifyTrackDetails = {
  album: SpotifyAlbumDetails;
  artists: SpotifyArtistDetails[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: { [source: string]: string };
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  is_playable: boolean;
  linked_from: { [source: string]: string };
  restrictions: { reason?: string };
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: SpotifyContextType;
  uri: string;
  is_local: boolean;
  queue_position?: number;
};

type SpotifyTrackSummary = {
  id: string;
  title: string;
  artist: string;
  artists: string[];
  album: string;
  albumArtUrl: string;
  durationMs: number;
  duration: string;
  url: string;
  uri: string;
  queuePosition?: number;
  queuedBy?: string;
};

type SpotifyTrackSummaryWithPosition = SpotifyTrackSummary & {
  positionMs: number;
  position: string;
  relativePosition: number;
};

type SpotifyAlbumArtistDetails = {
  external_urls: { [source: string]: string };
  href: string;
  id: string;
  name: string;
  type: SpotifyContextType;
  uri: string;
};

type SpotifyArtistDetails = SpotifyAlbumArtistDetails & {
  followers: {
    href: string;
    total: number;
  };
  genres: string[];
  images: SpotifyImage[];
  popularity: number;
};

type SpotifyAlbumDetails = {
  album_type: SpotifyContextType;
  total_tracks: number;
  available_markets: string[];
  external_urls: SpotifyExternalUrls;
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions: { reason?: string };
  type: SpotifyContextType;
  uri: string;
  artists: SpotifyAlbumArtistDetails[];
};

type SpotifyAudiobookDetails = {};
type SpotifyEpisodeDetails = {};
type SpotifyShowDetails = {};

type SpotifySearchCategory<T> = {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items: T[];
};

type SpotifySearchResponseMap = {
  track: SpotifyTrackDetails;
  artist: SpotifyArtistDetails;
  album: SpotifyAlbumDetails;
  audiobook: SpotifyAudiobookDetails;
  playlist: SpotifyPlaylistDetails;
  show: SpotifyShowDetials;
  episode: SpotifyEpisodeDetails;
};

type FilterReason = "explicit" | "duration";

type FilteredSearchResult<T extends SpotifyContextType> = {
  reason: FilterReason;
  item: SpotifySearchResponseMap[T];
};

type SpotifySearchResponse = {
  [K in keyof SpotifySearchResponseMap as `${K}s`]: SpotifySearchCategory<
    SpotifySearchResponseMap[K]
  >;
} & {
  filtered: {
    [K in keyof SpotifySearchResponseMap as `filtered${Capitalize<K>}s`]?: FilteredSearchResult<
      SpotifySearchResponseMap[K]
    >[];
  };
};
//#endregion
