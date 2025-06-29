import { ApiEndpoint } from "@/types/api";
import { LyricsExistEndpoint } from "./lyrics-exist";
import { PingLyricsEndpoint } from "./ping-lyrics";
import { SaveLyricsEndpoint } from "./save-lyrics";
import { VersionCheckEndpoint } from "./version-check";

export const AllSpotifyCustomRoutes: ApiEndpoint[] = [
  LyricsExistEndpoint,
  PingLyricsEndpoint,
  SaveLyricsEndpoint,
  VersionCheckEndpoint,
];
