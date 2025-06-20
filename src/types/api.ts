import { Request, Response } from "express";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiEndpoint = [
  path: string,
  method: HttpMethod,
  handler: (req: Request, res: Response) => Promise<void>
];
