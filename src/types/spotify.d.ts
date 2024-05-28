type SpotifyApplication = {
  clientId: string;
  clientSecret: string;
};

type SpotifyAuth = {
  code?: string;
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  state?: string;
};

type SpotifyGetDevicesResponse = {
  devices: SpotifyDevice[];
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

type SpotifyImage = {
  url: string;
  height: number;
  width: number;
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

type SpotifyQueueResponse = {
  currently_playing: SpotifyTrackDetails;
  queue: SpotifyTrackDetails[];
};

type FindAndEnqueueTrackResponse = {
  success: boolean;
  data: SpotifyTrackDetails | string;
};
