//#region Unique Vars
type SpotifyRepeatState = "track" | "context" | "off";

type SpotifySearchType =
  | "album"
  | "artist"
  | "playlist"
  | "track"
  | "show"
  | "episode"
  | "audiobook";
//#endregion

type SpotifyRefreshTokenResponse = {
  access_token: string;
  token_type: string;
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
  external_urls: { [platform: string]: string };
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
  context: {
    type: string;
    href: string;
    external_urls: { [platform: string]: string };
    uri: string;
  };
  progress_ms: number;
  item: SpotifyTrackDetails;
  currently_playing_type: string;
  currently_playing_type: string;
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
  type: string;
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
  context: {
    type: string;
    href: string;
    external_urls: { [platform: string]: string };
    uri: string;
  };
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyTrackDetails;
  currently_playing_type: string;
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

//#region Spotify API /search types
type SpotifyTrackDetails = {
  album: SpotifyAlbumDetails;
  artists: SpotifyArtistDetails[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: { [source: string]: string };
  external_urls: { [platform: string]: string };
  href: string;
  id: string;
  is_playable: boolean;
  linked_from: { [source: string]: string };
  restrictions: { reason?: string };
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: track;
  uri: string;
  is_local: boolean;
  queue_position?: number;
};

type SpotifyAlbumArtistDetails = {
  external_urls: { [source: string]: string };
  href: string;
  id: string;
  name: string;
  type: string;
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
  album_type: string;
  total_tracks: number;
  available_markets: string[];
  external_urls: { [platform: string]: string };
  href: string;
  id: string;
  images: SpotifyImage[];
  name: string;
  release_date: string;
  release_date_precision: string;
  restrictions: { reason?: string };
  type: string;
  uri: string;
  artists: SpotifyAlbumArtistDetails[];
};

type SpotifySearchCategory<T> = {
  href: string;
  limit: number;
  next: string;
  offset: number;
  previous: string;
  total: number;
  items: T[];
};

type SpotifySearchResponse = {
  tracks: SpotifySearchCategory<SpotifyTrackDetails>;
  artists: SpotifySearchCategory<SpotifyArtistDetails>;
  albums: SpotifySearchCategory<SpotifyAlbumDetails>;
  playlists: SpotifySearchCategory<SpotifyPlaylistDetails>;
  shows: SpotifySearchCategory<SpotifyShowDetials>;
  episodes: SpotifySearchCategory<SpotifyEpisodeDetails>;
  audiobooks: SpotifySearchCategory<SpotifyAudiobookDetails>;
};
//#endregion
