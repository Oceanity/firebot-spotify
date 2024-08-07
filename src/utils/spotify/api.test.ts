import "@/mocks/firebot";
import { SpotifyService } from "@utils/spotify";
import { SpotifyApiService } from "@utils/spotify/api";
import { jest } from "@jest/globals";
import { logger } from "@oceanity/firebot-helpers/firebot";

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
});
