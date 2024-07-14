import { getTestTrack, testTrigger } from "@/testData";
import { jest } from "@jest/globals";
import { SpotifyService } from "@/utils/spotify";
import { RawSpotifyTrackVariable } from "./rawSpotifyTrack";

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
  let testTrack: SpotifyTrackDetails;
  const name = "test track";
  const id = "test track id";

  beforeEach(() => {
    // Access the mocked spotify from the mocked @/main module
    spotify = require("@/main").spotify;
    testTrack = getTestTrack(name, id);

    // Mock the summary getter on the track object
    Object.defineProperty(spotify.player.track, "raw", {
      get: jest.fn(() => testTrack),
      configurable: true,
    });
  });

  it("returns all details on current track", async () => {
    const response = await RawSpotifyTrackVariable.evaluator(testTrigger);
    expect(response).toEqual(testTrack);
    expect(response.name).toEqual(name);
    expect(response.id).toEqual(id);
  });

  it("returns null when queue is undefined", async () => {
    Object.defineProperty(spotify.player.track, "raw", {
      get: jest.fn(() => undefined),
      configurable: true,
    });
    const response = await RawSpotifyTrackVariable.evaluator(testTrigger);
    expect(response).toEqual(null);
  });

  it("returns null when queue is null", async () => {
    Object.defineProperty(spotify.player.track, "raw", {
      get: jest.fn(() => null),
      configurable: true,
    });
    const response = await RawSpotifyTrackVariable.evaluator(testTrigger);
    expect(response).toEqual(null);
  });
});
