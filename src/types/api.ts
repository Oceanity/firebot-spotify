type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD";

type ApiEndpoint = [
  path: string,
  method: HttpMethod,
  handler: (req: HttpRequest, res: HttpResponse) => Promise<void>
];
