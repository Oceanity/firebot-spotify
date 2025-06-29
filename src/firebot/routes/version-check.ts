import { ApiEndpoint } from "@/types/api";
import { checkRemoteScriptVersionAsync } from "@/utils";
import { Request, Response } from "express";

export const VersionCheckEndpoint: ApiEndpoint = [
  "/version",
  "GET",
  async (req: Request, res: Response) => {
    try {
      const { v } = req.query;

      res
        .status(200)
        .send(await checkRemoteScriptVersionAsync(v as string | undefined));
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: error instanceof Error ? error.message : (error as string),
      });
    }
  },
];
