import { Request, Response } from "express";
import { ApiEndpoint } from ".";
import { version } from "@/main";
import ResponseError from "@/models/responseError";
import { logger } from "@/utils/firebot";

export const VersionCheckEndpoint: ApiEndpoint = [
  "/version",
  "GET",
  async (_req: Request, res: Response) => {
    try {
      res.status(200).send(await checkRemoteVersionAsync());
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: error instanceof Error ? error.message : (error as string),
      });
    }
  },
];

export async function checkRemoteVersionAsync() {
  let remoteVersion: string | null = null;
  let remoteIsNewer = false;

  try {
    const githubPackageResponse = await fetch(
      "https://raw.githubusercontent.com/Oceanity/firebot-spotify/main/package.json"
    );
    remoteVersion = (await githubPackageResponse.json()).version;

    if (!remoteVersion)
      throw new ResponseError(
        "Failed to get remote version",
        githubPackageResponse
      );

    const splitLocal = version.split(".");
    const splitRemote = remoteVersion.split(".");

    for (let i = 0; i < Math.min(splitLocal.length, splitRemote.length); i++) {
      // Ensure that both versions have the same number of sections
      if (!splitLocal[i]) splitLocal[i] = "0";
      if (!splitRemote[i]) splitRemote[i] = "0";

      // Check numerically and alphabetically
      const localInt = Number(splitLocal[i]);
      const remoteInt = Number(splitRemote[i]);

      if (remoteInt > localInt || splitRemote[i] > splitLocal[i]) {
        remoteIsNewer = true;
        break;
      }
    }
  } catch (error) {
    logger.error("Error checking remote version", error);
  }
  return {
    currentVersion: version,
    latestVersion: remoteVersion,
    newVersionAvailable: remoteIsNewer,
  };
}