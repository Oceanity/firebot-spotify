import { Request, Response } from "express";
import { saveLyricsEndpoint } from "./saveLyrics";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

export type ApiEndpoint = [
  path: string,
  method: HttpMethod,
  handler: (req: Request, res: Response) => Promise<void>
];

export const AllSpotifyWebhooks: ApiEndpoint[] = [saveLyricsEndpoint];