import { logger } from "@oceanity/firebot-helpers/firebot";
import { SpotifyService } from ".";
import ResponseError from "@/models/responseError";
import RateLimitedError from "@/models/rateLimitedError";
import {
  formatMsToTimecode,
  getErrorMessage,
} from "@oceanity/firebot-helpers/string";
import { mergeObjects } from "@oceanity/firebot-helpers/object";
import { now } from "@utils/time";

type SpotifyFetchResponse<T> = {
  status: number;
  ok: boolean;
  data: T | null;
};

type SpotifyHttpRequestMethod = "GET" | "POST" | "PUT" | "DELETE";

export class SpotifyApiService {
  private readonly spotify: SpotifyService;

  /**
   * Spotify rate limits per app rather than per endpoint, so a 429 on any
   * endpoint has to quiet all of them.
   */
  private _backoffUntil: number = 0;

  // Spotify's rate limit window is rolling and roughly 30s
  private static readonly defaultRetryAfterSeconds = 30;
  private static readonly maxRetryAfterSeconds = 300;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public readonly baseUrl = "https://api.spotify.com/v1";
  public getUrlFromPath = (path: string): string => `${this.baseUrl}${path}`;

  /**
   * Time remaining until the API may be used again, in milliseconds.
   * `0` when not currently rate limited.
   */
  public get backoffRemainingMs(): number {
    return Math.max(0, this._backoffUntil - now());
  }

  /**
   * Makes a request to the Spotify API.
   * @param endpoint The API endpoint to request.
   * @param method The HTTP method to use. Defaults to GET.
   * @param options Additional fetch options.
   * @returns An object containing the response status, ok status, and data.
   * @throws {RateLimitedError} If the app is currently rate limited by Spotify.
   * @throws {ResponseError} If the response status is not OK.
   * @throws {Error} If there is an error with the request.
   */
  public async fetch<T>(
    endpoint: string,
    method: SpotifyHttpRequestMethod = "GET",
    options?: any
  ): Promise<SpotifyFetchResponse<T>> {
    try {
      const backoffRemainingMs = this.backoffRemainingMs;

      if (backoffRemainingMs > 0) {
        // Deliberately silent. Opening the window already warned once, and
        // callers poll through it many times over
        throw new RateLimitedError(
          `Spotify API endpoint ${endpoint} is rate limited, will be able to be used again in ${formatMsToTimecode(
            backoffRemainingMs
          )}`,
          backoffRemainingMs
        );
      }

      const accessToken = await this.spotify.auth.accessToken;

      const url: string = this.getUrlFromPath(endpoint);

      const request: RequestInit = mergeObjects(
        {
          method,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
        options
      );
      const response = await fetch(url, request);

      if (!response.ok) {
        switch (response.status) {
          case 401:
            throw new ResponseError(
              `Spotify API endpoint ${endpoint} responded Unauthorized, try unlinking and relinking Spotify to generate a new Access/Refresh token pair`,
              response
            );
          case 429: {
            const retryAfterMs = this.startBackoff(
              response.headers.get("retry-after")
            );

            // The one warning for the window we just opened
            logger.warn(
              `Spotify API endpoint ${endpoint} responded Rate Limit Exceeded, backing off all requests for ${formatMsToTimecode(
                retryAfterMs
              )}`
            );

            throw new RateLimitedError(
              `Spotify API endpoint ${endpoint} responded Rate Limit Exceeded, will be able to be used again in ${formatMsToTimecode(
                retryAfterMs
              )}`,
              retryAfterMs
            );
          }
          default:
            throw new ResponseError(
              `Spotify API ${endpoint} returned status ${response.status}`,
              response
            );
        }
      }

      if (response.status === 204 || method !== "GET") {
        return {
          status: response.status,
          ok: response.ok,
          data: null,
        };
      }

      const data = await response.json();

      return {
        status: response.status,
        ok: response.ok,
        data,
      };
    } catch (error) {
      // Rate limiting is already reported once per window, don't repeat it per call
      if (error instanceof RateLimitedError) throw error;

      const message = getErrorMessage(error);
      logger.error(message, error);
      throw error;
    }
  }

  /**
   * Opens a backoff window for every endpoint based on Spotify's `Retry-After`
   * header, falling back to the length of Spotify's rate limit window and
   * capping it so an unexpected header can't take the integration offline.
   *
   * @param retryAfterHeader The value of the `Retry-After` response header.
   * @returns The length of the backoff window in milliseconds.
   */
  private startBackoff(retryAfterHeader: string | null): number {
    const parsed = retryAfterHeader ? parseInt(retryAfterHeader, 10) : NaN;

    // Add a second of padding so we don't come back a hair too early
    const requestedSeconds = Number.isFinite(parsed)
      ? parsed + 1
      : SpotifyApiService.defaultRetryAfterSeconds;

    const seconds = Math.min(
      Math.max(requestedSeconds, 1),
      SpotifyApiService.maxRetryAfterSeconds
    );

    const retryAfterMs = seconds * 1000;
    this._backoffUntil = now() + retryAfterMs;

    return retryAfterMs;
  }
}
