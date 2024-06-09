import { Request, Response } from "express";
import { ApiEndpoint } from ".";

export const PingLyricsEndpoint: ApiEndpoint = [
  "/lyrics/ping",
  "GET",
  async (_req: Request, res: Response) => {
    try {
      res.status(204).send();
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: error instanceof Error ? error.message : (error as string),
      });
    }
  },
];
