import { version as localVersion } from "@/main";
import ResponseError from "@/models/responseError";
import { logger } from "@oceanity/firebot-helpers/firebot";

export const VersionCheckEndpoint: ApiEndpoint = [
  "/version",
  "GET",
  async (req: HttpRequest, res: HttpResponse) => {
    try {
      const { v } = req.query;

      res
        .status(200)
        .send(await checkRemoteVersionAsync(v as string | undefined));
    } catch (error) {
      res.status(500).send({
        status: 500,
        message: error instanceof Error ? error.message : (error as string),
      });
    }
  },
];

type RemoteVersionCheckResponse = {
  localVersion: string;
  remoteVersion: string | null;
  newVersionAvailable: boolean;
};

export async function checkRemoteVersionAsync(
  providedVersion?: string
): Promise<RemoteVersionCheckResponse> {
  let remoteVersion: string | null = null;
  let remoteIsNewer = false;

  const checkedVersion = providedVersion ?? localVersion;

  try {
    const githubPackageResponse = await fetch(
      "https://raw.githubusercontent.com/Oceanity/firebot-spotify/main/package.json"
    );
    remoteVersion = (await githubPackageResponse.json()).version;

    if (remoteVersion === null)
      throw new ResponseError(
        "Failed to get remote version",
        githubPackageResponse
      );

    const splitLocal = checkedVersion.split(".");
    const splitRemote = remoteVersion.split(".");

    for (let i = 0; i < Math.min(splitLocal.length, splitRemote.length); i++) {
      // Ensure that both versions have the same number of sections
      if (!splitLocal[i]) splitLocal[i] = "0";
      if (!splitRemote[i]) splitRemote[i] = "0";

      // Check numerically and alphabetically
      const localInt = parseInt(splitLocal[i]);
      const remoteInt = parseInt(splitRemote[i]);

      if (remoteInt > localInt || splitRemote[i] > splitLocal[i]) {
        remoteIsNewer = true;
        break;
      } else if (remoteInt < localInt || splitRemote[i] < splitLocal[i]) {
        break;
      }
    }
  } catch (error) {
    logger.error("Error checking remote version", error);
  }

  return {
    localVersion: checkedVersion,
    remoteVersion,
    newVersionAvailable: remoteIsNewer,
  };
}
