import { Request, Response } from "express";
import { ApiEndpoint } from ".";
import { spotify } from "@/main";
import { LyricsHelpers } from "@/utils/spotify/player/lyrics";

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
      if (
        !req.body.id ||
        !req.body.data ||
        req.body.id === "undefined" ||
        req.body.data === "{}"
      ) {
        res.status(400).send({
          status: 400,
          message: "Missing id or data",
        });
      }

      const { id, data } = req.body;

      if (data === "{}") return;

      if (await LyricsHelpers.lyricsFileExistsAsync(id)) {
        res.status(409).send({
          status: 409,
          message: "File already exists",
        });
        return;
      }

      await spotify.player.lyrics.saveLyrics(id, data);

      const trackData = await spotify.getTrackAsync(id);

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
