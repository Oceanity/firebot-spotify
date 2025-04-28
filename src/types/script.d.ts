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

type LyricsLine = {
  startTimeMs: string;
  words: string;
  syllables: string[];
  endTimeMs: string;
};

type FormattedLyricsLine = Overwrite<
  LyricsLine,
  {
    startTimeMs: number;
    endTimeMs: number;
  }
>;

type LyricsSyncType = "LINE_SYNCED" | "UNSYNCED";

type LyricsData = {
  lyrics: {
    syncType: LyricsSyncType;
    lines: LyricsLine[];
    provider: string;
    providerLyricsId: string;
    providerDisplayName: string;
    syncLyricsUri: string;
    isDenseTypeface: boolean;
    alternatives: string[];
    language: string;
    isRtlLanguage: boolean;
    showUpsell: boolean;
    capStatus: string;
  };
  colors: {
    background: number;
    text: number;
    highlightText: number;
  };
  hasVocalRemoval: boolean;
};

type FormattedLyricsData = Overwrite<
  LyricsData,
  {
    lines: FormattedLyricsLine[];
  }
>;
