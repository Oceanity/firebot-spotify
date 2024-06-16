import { testLyricData } from "@/testData";
import { SpotifyService } from "..";
import { SpotifyLyricsService, LyricsHelpers } from "./lyrics";

describe("Spotify - Lyrics Service", () => {
  let spotify: SpotifyService;
  let lyrics: SpotifyLyricsService;

  const defaults = {
    trackHasLyrics: false,
    currentLine: "",
  };

  beforeEach(() => {
    spotify = new SpotifyService();
    lyrics = new SpotifyLyricsService(spotify);

    jest
      .spyOn(LyricsHelpers, "lyricsFileExistsAsync")
      .mockImplementation(() => Promise.resolve(true));
    jest
      .spyOn(LyricsHelpers, "lyricsFilePathFromId")
      .mockImplementation(() => "good file path");
    jest
      .spyOn(LyricsHelpers, "loadLyricsFileAsync")
      .mockImplementation(() => Promise.resolve(testLyricData));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Getters", () => {
    it("should have default getter values", async () => {
      jest
        .spyOn(LyricsHelpers, "lyricsFileExistsAsync")
        .mockImplementation(() => Promise.resolve(false));

      const fileExists = await lyrics.trackHasLyricsFile;
      expect(fileExists).toBe(false);

      for (const [key, value] of Object.entries(defaults)) {
        expect(lyrics[key as keyof SpotifyLyricsService]).toBe(value);
      }
    });
  });

  describe("Helper Functions", () => {
    describe("lyricsFileExistsAsync", () => {
      it("should return true if file exists if path check resolves true", async () => {
        const fileExists = await lyrics.trackHasLyricsFile;
        expect(fileExists).toBe(true);
      });

      it("should load lyrics file if file exists", async () => {
        await lyrics.loadLyricsFileAsync();

        const response = await lyrics.formatLines(testLyricData);

        expect(response).toEqual(
          testLyricData.lyrics.lines.map((l) => ({
            ...l,
            startTimeMs: Number(l.startTimeMs),
            endTimeMs: Number(l.endTimeMs),
          }))
        );
      });
    });
  });
});
