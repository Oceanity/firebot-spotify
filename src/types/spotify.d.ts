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
