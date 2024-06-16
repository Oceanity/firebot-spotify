import { SpotifyService } from "@utils/spotify";
import { SpotifyApiService } from "@utils/spotify/api";
import { jest } from "@jest/globals";
import { integrationManager, logger } from "@utils/firebot";

type DummyDataType = {
  foo: string;
  bar: number;
};

jest.mock("@utils/firebot", () => ({
  logger: {
    error: jest.fn(),
  },
  integrationManager: {
    getIntegrationById: jest.fn(() => null),
  },
  chatFeedAlert: jest.fn(() => {}),
}));

describe("SpotifyApiService", () => {
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
      json: () => Promise.resolve(dummyData),
    }));

    const response = await api.fetch<DummyDataType>("/foo/bar");

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data).toEqual(dummyData);
  });

  it("should return null if response is 204", async () => {
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

  it("should throw error if response is 404", async () => {
    const endpoint = "/foo/bar";
    const status = 404;

    // @ts-expect-error ts2322
    global.fetch = jest.fn(() => ({
      ok: false,
      status,
    }));

    jest.mock("@utils/firebot", () => ({
      logger: {
        error: jest.fn(),
      },
      chatFeedAlert: jest.fn(() => {}),
    }));

    await expect(api.fetch<DummyDataType>(endpoint)).rejects.toThrow();
  });
});
