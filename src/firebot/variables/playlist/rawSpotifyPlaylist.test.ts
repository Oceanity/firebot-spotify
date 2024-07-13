import "@/mocks/firebot";
import { testTrigger, testPlaylist } from "@/testData";
import { jest } from "@jest/globals";
import { SpotifyService } from "@/utils/spotify";
import { RawSpotifyPlaylistVariable } from "./rawSpotifyPlaylist";

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

describe("Spotify - Playlist Replace Variable", () => {
  let spotify: SpotifyService;

  beforeEach(() => {
    // Access the mocked spotify from the mocked @/main module
    spotify = require("@/main").spotify;

    // Mock the summary getter on the queue object
    Object.defineProperty(spotify.player.playlist, "raw", {
      get: jest.fn(() => testPlaylist),
      configurable: true,
    });
  });

  it("returns all details on current playlist", async () => {
    const response = await RawSpotifyPlaylistVariable.evaluator(testTrigger);
    expect(response).toEqual(testPlaylist);
  });

  it("returns null when queue is undefined", async () => {
    Object.defineProperty(spotify.player.playlist, "raw", {
      get: jest.fn(() => undefined),
      configurable: true,
    });
    const response = await RawSpotifyPlaylistVariable.evaluator(testTrigger);
    expect(response).toEqual(null);
  });

  it("returns null when queue is null", async () => {
    Object.defineProperty(spotify.player.playlist, "raw", {
      get: jest.fn(() => null),
      configurable: true,
    });
    const response = await RawSpotifyPlaylistVariable.evaluator(testTrigger);
    expect(response).toEqual(null);
  });
});
