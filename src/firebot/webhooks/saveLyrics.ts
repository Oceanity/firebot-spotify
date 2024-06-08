import { Request, Response } from "express";
import { ApiEndpoint } from ".";
import { effectRunner, jsonDb, logger } from "@/utils/firebot";
import { integrationId } from "@/main";
import { resolve } from "path";
import { ensureDir, pathExists } from "fs-extra";
import { spotify } from "@/main";
import { JsonDB } from "node-json-db";
import DbService from "@/utils/db";

const lyricsDb = new DbService("./oceanitySpotifyLyrics.json", true, false);

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

      const { id, data } = req.body;

      let existing;
      try {
        existing = await lyricsDb.getAsync(`/${id}`);
      } catch (error) {}

      if (existing) {
        res.status(409).send({
          status: 409,
          message: `File ${id} already exists`,
        });
        return;
      }

      try {
        await lyricsDb.pushAsync(`/${id}`, data, true);
      } catch (error) {
        logger.error("Error saving lyrics to disk", error);
      }

      res.status(200).send({
        status: 200,
        message: "OK",
        track: id,
      });
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: error instanceof Error ? error.message : (error as string),
      });
    }
  },
];
