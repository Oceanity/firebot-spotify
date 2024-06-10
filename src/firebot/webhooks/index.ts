import { Request, Response } from "express";
import { LyricsExistEndpoint } from "./lyricsExist";
import { PingLyricsEndpoint } from "./pingLyrics";
import { SaveLyricsEndpoint } from "./saveLyrics";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export type ApiEndpoint = [
  path: string,
  method: HttpMethod,
  handler: (req: Request, res: Response) => Promise<void>
];

export const AllSpotifyWebhooks: ApiEndpoint[] = [
  LyricsExistEndpoint,
  PingLyricsEndpoint,
  SaveLyricsEndpoint,
];
