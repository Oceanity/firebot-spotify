import "@/mocks/firebot";
import { SpotifyService } from "@utils/spotify";
import { SpotifyApiService } from "@utils/spotify/api";
import { jest } from "@jest/globals";
import { logger } from "@oceanity/firebot-helpers/firebot";
import RateLimitedError from "@/models/rateLimitedError";

type DummyDataType = {
  foo: string;
  bar: number;
};

describe("Spotify - Api Service", () => {
  let spotify: SpotifyService;
  let api: SpotifyApiService;

  const dummyData: DummyDataType = {
    foo: "bar",
    bar: 123,
  };

  beforeEach(() => {
    spotify = new SpotifyService();
    api = new SpotifyApiService(spotify);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should successfully fetch data", async () => {
    // @ts-expect-error ts2322
    global.fetch = jest.fn(() => ({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(dummyData)),
      json: () => Promise.resolve(dummyData),
    }));

    const response = await api.fetch<DummyDataType>("/foo/bar");

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(dummyData);
  });

  it("returns null if response is 204", async () => {
    // @ts-expect-error ts2322
    global.fetch = jest.fn(() => ({
      ok: true,
      status: 204,
    }));

    const response = await api.fetch<DummyDataType>("/foo/bar");

    expect(response.ok).toBe(true);
    expect(response.status).toBe(204);
    expect(response.data).toBe(null);
  });

  it("should throw error if response has expected error code", async () => {
    const endpoint = "/foo/bar";
    for (const status of [400, 401, 403, 404, 500]) {
      // @ts-expect-error ts2322
      global.fetch = jest.fn(() => ({
        ok: false,
        status,
      }));

      await expect(api.fetch<DummyDataType>(endpoint)).rejects.toThrow();
      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error)
      );
    }
  });

  describe("rate limiting", () => {
    // Returns a 429 carrying the given Retry-After header, omitted when undefined
    const rateLimited = (retryAfter?: string) =>
      jest.fn(() => ({
        ok: false,
        status: 429,
        headers: {
          get: (name: string) =>
            name === "retry-after" ? retryAfter ?? null : null,
        },
      }));

    it("throws a RateLimitedError and opens a backoff window on 429", async () => {
      // @ts-expect-error ts2322
      global.fetch = rateLimited("5");

      await expect(api.fetch("/playlists/abc")).rejects.toBeInstanceOf(
        RateLimitedError
      );

      expect(api.backoffRemainingMs).toBeGreaterThan(0);
      // 5s from the header, plus a second of padding
      expect(api.backoffRemainingMs).toBeLessThanOrEqual(6000);
    });

    it("suppresses further requests without hitting the network", async () => {
      const fetchMock = rateLimited("5");
      // @ts-expect-error ts2322
      global.fetch = fetchMock;

      await expect(api.fetch("/playlists/abc")).rejects.toThrow();
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // The poll loop would keep calling, none of these may reach Spotify
      for (let i = 0; i < 5; i++) {
        await expect(api.fetch("/playlists/abc")).rejects.toBeInstanceOf(
          RateLimitedError
        );
      }
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("backs off every endpoint, not just the one that was limited", async () => {
      const fetchMock = rateLimited("5");
      // @ts-expect-error ts2322
      global.fetch = fetchMock;

      await expect(api.fetch("/playlists/abc")).rejects.toThrow();

      // Spotify rate limits per app, so an unrelated endpoint has to wait too
      await expect(api.fetch("/me/player")).rejects.toBeInstanceOf(
        RateLimitedError
      );
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("reports the remaining wait on the error", async () => {
      // @ts-expect-error ts2322
      global.fetch = rateLimited("5");

      await expect(api.fetch("/playlists/abc")).rejects.toMatchObject({
        retryAfterMs: 6000,
      });
    });

    it("waits Spotify's rate limit window, not an hour, with no Retry-After", async () => {
      // @ts-expect-error ts2322
      global.fetch = rateLimited();

      await expect(api.fetch("/playlists/abc")).rejects.toThrow();

      expect(api.backoffRemainingMs).toBeGreaterThan(29000);
      expect(api.backoffRemainingMs).toBeLessThanOrEqual(30000);
    });

    it("caps an unreasonable Retry-After", async () => {
      // @ts-expect-error ts2322
      global.fetch = rateLimited("100000");

      await expect(api.fetch("/playlists/abc")).rejects.toThrow();

      expect(api.backoffRemainingMs).toBeLessThanOrEqual(300000);
      expect(api.backoffRemainingMs).toBeGreaterThan(299000);
    });

    it("warns once per backoff window rather than once per suppressed call", async () => {
      // @ts-expect-error ts2322
      global.fetch = rateLimited("5");

      await expect(api.fetch("/playlists/abc")).rejects.toThrow();

      for (let i = 0; i < 10; i++) {
        await expect(api.fetch("/playlists/abc")).rejects.toThrow();
      }

      expect(logger.warn).toHaveBeenCalledTimes(1);
    });

    it("does not log rate limiting as an error", async () => {
      // @ts-expect-error ts2322
      global.fetch = rateLimited("5");

      await expect(api.fetch("/playlists/abc")).rejects.toThrow();
      await expect(api.fetch("/playlists/abc")).rejects.toThrow();

      // Rate limiting is expected traffic shaping, it belongs at warn
      const errors = (logger.error as jest.Mock).mock.calls;
      expect(
        errors.filter(([message]) => String(message).includes("Rate Limit"))
      ).toHaveLength(0);
    });
  });
});
