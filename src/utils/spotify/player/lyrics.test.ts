import { SpotifyService } from "..";
import { SpotifyLyricsService, LyricsHelpers } from "./lyrics";

describe("SpotifyLyricsService", () => {
  let spotify: SpotifyService;
  let lyrics: SpotifyLyricsService;

  const goodLyricId = "1234";

  const defaults = {
    trackHasLyrics: false,
    currentLine: "",
  };

  beforeEach(() => {
    spotify = new SpotifyService();
    lyrics = new SpotifyLyricsService(spotify);

    jest
      .spyOn(LyricsHelpers, "fileExistsAsync")
      .mockImplementation(() => Promise.resolve(false));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should have default getter values", async () => {
    const fileExists = await lyrics.trackHasLyricsFile;
    expect(fileExists).toBe(false);

    for (const [key, value] of Object.entries(defaults)) {
      expect(lyrics[key as keyof SpotifyLyricsService]).toBe(value);
    }
  });

  it("should return true if file exists", async () => {
    jest
      .spyOn(LyricsHelpers, "fileExistsAsync")
      .mockImplementation(() => Promise.resolve(true));

    const fileExists = await lyrics.trackHasLyricsFile;
    expect(fileExists).toBe(true);
  });
});
