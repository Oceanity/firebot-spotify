import { checkRemoteScriptVersionAsync } from "@/utils";

export const VersionCheckEndpoint: ApiEndpoint = [
  "/version",
  "GET",
  async (req: HttpRequest, res: HttpResponse) => {
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
