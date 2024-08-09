import "@/mocks/firebot";
import { SpotifyService } from "@utils/spotify";
import { jest } from "@jest/globals";
import { getTestTrack, testSearchResponse } from "@/testData";
import { logger } from "@oceanity/firebot-helpers/firebot";

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
    it("returns search response", async () => {
      const response = await spotify.searchAsync("testing", "track");

      expect(response).toBe(testSearchResponse);
    });

    it("returns expected number of tracks", async () => {
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

    it("returns expected number of tracks when filtering explicit", async () => {
      testSearchResponse.tracks.items = [
        getTestTrack("track 1"),
        getTestTrack("track 2"),
        getTestTrack("track 3", "3", true),
        getTestTrack("track 4", "4", true),
        getTestTrack("track 5", "5", true),
      ];
      const response = await spotify.searchAsync("testing", "track", {
        filterExplicit: true,
      });

      expect(response.tracks.items.length).toBe(2);
      expect(response.filtered.filteredTracks!.length).toBe(3);

      for (const filtered of response.filtered.filteredTracks!) {
        expect(filtered.reason).toBe("explicit");
      }
    });

    it("returns expected number of tracks when filtering duration", async () => {
      testSearchResponse.tracks.items = [
        getTestTrack("track 1"),
        getTestTrack("track 2"),
        getTestTrack("track 3", "3", false, 60000),
        getTestTrack("track 4", "4", false, 60000),
        getTestTrack("track 5", "5", false, 60000),
      ];
      const response = await spotify.searchAsync("testing", "track", {
        maxLengthMinutes: 1,
      });

      expect(response.tracks.items.length).toBe(2);
      expect(response.filtered.filteredTracks?.length).toBe(3);

      for (const filtered of response.filtered.filteredTracks!) {
        expect(filtered.reason).toBe("duration");
      }
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
