export default class RateLimitedError extends Error {
  retryAfterMs: number;

  constructor(message: string, retryAfterMs: number) {
    super(message);
    this.name = this.constructor.name; // Set the error name to the class name
    this.retryAfterMs = retryAfterMs;

    // Set the prototype explicitly, because extending built-ins like Error in TypeScript requires it
    Object.setPrototypeOf(this, RateLimitedError.prototype);
  }
}
