import { HttpServerManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/http-server-manager";
import { Request, Response } from "express";

export default class Router {
  public static registerHooks(httpServer: HttpServerManager) {
    httpServer.registerCustomRoute(
      "oceanitySongRequests",
      "/oauth/callback",
      "GET",
      async (req: Request, _res: Response) => {
        req.params.token;
      }
    );
  }
}
