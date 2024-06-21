import {
  getTestPlaylistSummary,
  getTestTrackSummary,
  testTrigger,
} from "@/testData";
import { SpotifyPlaylistVariable } from "./spotifyPlaylist";
import { jest } from "@jest/globals";
import { SpotifyService } from "@/utils/spotify";

// Mocking the entire @/main module to provide the mocked spotify instance
jest.mock("@/main", () => ({
  spotify: {
    player: {
      playlist: {},
    },
    events: {
      trigger: jest.fn(),
    },
  },
}));

describe("Spotify Queue Replace Variable", () => {
  let spotify: SpotifyService;
  let testPlaylist: SpotifyPlaylistSummary;

  beforeEach(() => {
    // Access the mocked spotify from the mocked @/main module
    spotify = require("@/main").spotify;

    testPlaylist = getTestPlaylistSummary("my playlist");
    testPlaylist.tracks = [
      getTestTrackSummary("track 1"),
      getTestTrackSummary("track 2"),
      getTestTrackSummary("track 3"),
      getTestTrackSummary("track 4"),
      getTestTrackSummary("track 5"),
    ];

    // Mock the summary getter on the queue object
    Object.defineProperty(spotify.player.playlist, "summary", {
      get: jest.fn(() => testPlaylist),
      configurable: true,
    });
  });

  it("should return entire queue with expected number of tracks when not passed argument", async () => {
    const response = await SpotifyPlaylistVariable.evaluator(
      testTrigger,
      undefined
    );
    expect(response).toEqual(testPlaylist);
  });
});
