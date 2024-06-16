import { SpotifyService } from "@utils/spotify";
import { jest } from "@jest/globals";
import { testSearchResponse, testTrack } from "@/testData";

describe("Spotify Service", () => {
  let spotify: SpotifyService;

  beforeEach(() => {
    spotify = new SpotifyService();

    jest
      .spyOn(spotify, "searchAsync")
      .mockReturnValue(Promise.resolve(testSearchResponse));
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
        testTrack,
        testTrack,
        testTrack,
        testTrack,
        testTrack,
      ];
      const response = await spotify.searchAsync("testing", "track");

      expect(response.tracks.items.length).toBe(5);
    });
  });
});
