import { LyricsExistEndpoint } from "./lyricsExist";
import { PingLyricsEndpoint } from "./pingLyrics";
import { SaveLyricsEndpoint } from "./saveLyrics";
import { VersionCheckEndpoint } from "./versionCheck";

export const AllSpotifyWebhooks: ApiEndpoint[] = [
  LyricsExistEndpoint,
  PingLyricsEndpoint,
  SaveLyricsEndpoint,
  VersionCheckEndpoint,
];
