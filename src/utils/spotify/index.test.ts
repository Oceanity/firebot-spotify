import { SpotifyService } from "@utils/spotify";
import { jest } from "@jest/globals";
import { getTestTrack, testSearchResponse, testTrack } from "@/testData";
import { logger } from "../firebot";
import ResponseError from "@/models/responseError";

jest.mock("@utils/firebot", () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe("Spotify Service", () => {
  let spotify: SpotifyService;

  beforeEach(() => {
    spotify = new SpotifyService();

    jest
      .spyOn(spotify.api, "fetch")
      .mockReturnValue(
        Promise.resolve({ ok: true, status: 200, data: testSearchResponse })
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("searchAsync", () => {
    it("search returns search response", async () => {
      const response = await spotify.searchAsync("testing", "track");

      expect(response).toBe(testSearchResponse);
    });

    it("search returns expected number of tracks", async () => {
      testSearchResponse.tracks.items = [
        getTestTrack("track 1"),
        getTestTrack("track 2"),
        getTestTrack("track 3"),
        getTestTrack("track 4"),
        getTestTrack("track 5"),
      ];
      const response = await spotify.searchAsync("testing", "track");

      expect(response.tracks.items.length).toBe(5);
    });

    it("throws exception when search returns null", async () => {
      jest
        .spyOn(spotify.api, "fetch")
        .mockReturnValue(
          Promise.resolve({ ok: true, status: 200, data: null })
        );

      await expect(spotify.searchAsync("testing", "track")).rejects.toThrow(
        "Could not retrieve Spotify track"
      );
      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error)
      );
    });
  });
});
