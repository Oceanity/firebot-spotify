interface Params {
  spotifyClientId: string;
  spotifyClientSecret: string;
}

interface UnknownError {
  [key: string]: unknown;
}

type AuthDefinition = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
};
