import { Request, Response } from "express";
import { ApiEndpoint } from ".";
import { lyricsFileExistsAsync } from "@/utils/spotify/player/lyrics";

export const LyricsExistEndpoint: ApiEndpoint = [
  "/lyrics/exists",
  "GET",
  async (req: Request, res: Response) => {
    try {
      let { id } = req.query;

      if (!id) {
        res.status(400).send({
          status: 400,
          message: "Missing id",
        });
        return;
      }

      res.status(200).send({
        exists: await lyricsFileExistsAsync(id as string),
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: error instanceof Error ? error.message : (error as string),
      });
    }
  },
];
