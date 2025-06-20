import { ApiEndpoint } from "@/types/api";
import { LyricsExistEndpoint } from "./lyricsExist";
import { PingLyricsEndpoint } from "./pingLyrics";
import { SaveLyricsEndpoint } from "./saveLyrics";
import { VersionCheckEndpoint } from "./versionCheck";

export const AllSpotifyCustomRoutes: ApiEndpoint[] = [
  LyricsExistEndpoint,
  PingLyricsEndpoint,
  SaveLyricsEndpoint,
  VersionCheckEndpoint,
];
