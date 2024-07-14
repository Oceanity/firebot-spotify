import { getTestTrackSummary, testTrigger } from "@/testData";
import { SpotifyTrackVariable } from "./spotifyTrack";
import { jest } from "@jest/globals";
import { SpotifyService } from "@/utils/spotify";

// Mocking the entire @/main module to provide the mocked spotify instance
jest.mock("@/main", () => ({
  spotify: {
    player: {
      track: {},
    },
  },
}));

describe("Spotify - Track Replace Variable", () => {
  let spotify: SpotifyService;
  let testTrack: SpotifyTrackSummary;

  beforeEach(() => {
    // Access the mocked spotify from the mocked @/main module
    spotify = require("@/main").spotify;
    testTrack = getTestTrackSummary("test track");

    // Mock the summary getter on the track object
    Object.defineProperty(spotify.player.track, "summary", {
      get: jest.fn(() => testTrack),
      configurable: true,
    });
  });

  it("returns currently playing track when not passed argument", async () => {
    const response = await SpotifyTrackVariable.evaluator(
      testTrigger,
      undefined
    );
    expect(response).toEqual(testTrack);
  });

  it("returns field of currently playing track when passed field", async () => {
    const response = await SpotifyTrackVariable.evaluator(testTrigger, "title");
    expect(response).toEqual(testTrack.title);
  });

  it("returns empty string when passed invalid field", async () => {
    const response = await SpotifyTrackVariable.evaluator(
      testTrigger,
      "invalid"
    );
    expect(response).toEqual("");
  });

  it("returns empty string when passed field when track does not exist", async () => {
    Object.defineProperty(spotify.player.track, "summary", {
      get: jest.fn(() => undefined),
      configurable: true,
    });
    const response = await SpotifyTrackVariable.evaluator(testTrigger, "title");
    expect(response).toEqual("");
  });
});
