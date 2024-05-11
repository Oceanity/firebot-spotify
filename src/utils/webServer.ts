import { Request, Response } from "express";
import Store from "@utils/store";

type HttpMethod =
  | "GET"
  | "POST"
  | "PUT"
  | "PATCH"
  | "DELETE"
  | "HEAD"
  | "CONNECT"
  | "OPTIONS"
  | "TRACE";

type HttpServerRequest = (req: Request, res: Response) => Promise<void>;

type ApiEndpoint = [
  path: string,
  method: HttpMethod,
  handler: HttpServerRequest
];

export function RegisterAllEndpoints(
  endpoints: ApiEndpoint[],
  apiName?: string
): void {
  for (const [path, method, handler] of endpoints) {
    if (
      !Store.Modules.httpServer.registerCustomRoute(
        Store.Prefix,
        path,
        method,
        handler
      )
    ) {
      throw `Could not register all endpoints for ${
        apiName ? `${apiName} ` : ""
      } API`;
    }
  }
}
