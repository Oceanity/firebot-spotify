import { Request, Response } from "express";
import { ApiEndpoint } from ".";
import { spotify } from "@/main";
import DbService from "@utils/db";
import { logger } from "@/utils/firebot";
import {
  lyricsFileExistsAsync,
  lyricsFilePath,
} from "@/utils/spotify/player/lyrics";

export const SaveLyricsEndpoint: ApiEndpoint = [
  "/lyrics/save",
  "POST",
  async (req: Request, res: Response) => {
    try {
      if (!req.body) {
        res.status(400).send({
          status: 400,
          message: "No request body",
        });
      }
      if (!req.body.id || !req.body.data) {
        res.status(400).send({
          status: 400,
          message: "Missing id or data",
        });
      }

      const { id, data } = req.body;

      if (data === "{}") return;

      if (await lyricsFileExistsAsync(id)) {
        res.status(409).send({
          status: 409,
          message: "File already exists",
        });
        return;
      }
      const filePath = lyricsFilePath(id);

      const db = new DbService(filePath, true, false);
      await db.pushAsync(`/`, data);

      const trackData = await spotify.getTrackAsync(id);

      logger.info(
        `Wrote lyrics to ${filePath} for ${trackData.artists[0].name} - ${trackData.name}`
      );

      res.status(200).send({
        status: 200,
        message: "OK",
        track: `${trackData.artists[0].name} - ${trackData.name}`,
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: error instanceof Error ? error.message : (error as string),
      });
    }
  },
];
