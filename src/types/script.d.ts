type AuthDefinition = {
  access_token: string;
  token_type: string;
  expires_in: number;
  expires_on: string;
  refresh_token: string;
  scope: string[];
};

type ClientCredentials = {
  id: string;
  secret: string;
};

interface Params {
  spotifyClientId: string;
  spotifyClientSecret: string;
}

type IntegrationDefinition<Params extends FirebotParams = FirebotParams> = {
  id: string;
  name: string;
  description: string;
  connectionToggle?: boolean;
  configurable?: boolean;
  settingCategories: FirebotParameterCategories<Params>;
} & (
  | {
      linkType: "id";
      idDetails: {
        steps: string;
      };
    }
  | {
      linkType: "auth";
      authProviderDetails: {
        id: string;
        name: string;
        redirectUriHost?: string;
        client: {
          id: string;
          secret: string;
        };
        auth: {
          type?: string;
          tokenHost: string;
          tokenPath: string;
          authorizePath: string;
          authorizeHost?: string;
        };
        autoRefreshToken?: boolean;
        scopes: string;
      };
    }
  | { linkType: "other" | "none" }
);
