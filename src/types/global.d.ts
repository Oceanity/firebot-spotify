import { Request, Response } from "express";

declare global {
  type HttpRequest = Request;
  type HttpResponse = Response;
}
