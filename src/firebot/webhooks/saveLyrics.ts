import { Request, Response } from "express";
import { ApiEndpoint } from ".";
import { effectRunner, logger } from "@/utils/firebot";
import { integrationId } from "@/main";
import { resolve } from "path";
import { ensureDir, pathExists } from "fs-extra";

export const saveLyricsEndpoint: ApiEndpoint = [
  "/lyrics/save",
  "POST",
  async (req: Request, res: Response) => {
    if (!req.body) {
      res.status(400).send({
        status: 400,
        message: "No request body",
      });
    }

    const { id, data } = req.body;

    await ensureDir(resolve(__dirname, `./lyrics`));

    const filepath = resolve(__dirname, `./lyrics/${id}.json`);
    if (await pathExists(filepath)) {
      res.status(409).send({
        status: 409,
        message: `File ${filepath} already exists`,
      });
      return;
    }

    logger.info("Saving new lyrics to file", filepath);

    effectRunner.processEffects({
      trigger: {
        type: "custom_script",
        metadata: {
          username: "script",
        },
      },
      effects: {
        id: `${integrationId}-${Date.now()}`,
        list: [
          {
            id: "fe33b3b0-221a-11ef-b7d3-7bb1e54e20e1",
            type: "firebot:filewriter",
            active: true,
            writeMode: "replace",
            deleteLineMode: "lines",
            replaceLineMode: "lineNumbers",
            text: JSON.stringify(data),
            filepath,
          },
        ],
      },
    });

    res.status(200).send({
      status: 200,
      message: "OK",
    });
  },
];
