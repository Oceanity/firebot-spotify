import { getTestTrackSummary, testTrigger } from "@/testData";
import { SpotifyQueueVariable } from "./spotifyQueue";
import { jest } from "@jest/globals";
import { SpotifyService } from "@/utils/spotify";

// Mocking the entire @/main module to provide the mocked spotify instance
jest.mock("@/main", () => ({
  spotify: {
    player: {
      queue: {},
    },
  },
}));

describe("Spotify - Queue Replace Variable", () => {
  let spotify: SpotifyService;
  let testQueue: SpotifyTrackSummary[];

  beforeEach(() => {
    // Access the mocked spotify from the mocked @/main module
    spotify = require("@/main").spotify;
    testQueue = [
      getTestTrackSummary("track 1"),
      getTestTrackSummary("track 2"),
      getTestTrackSummary("track 3"),
      getTestTrackSummary("track 4"),
      getTestTrackSummary("track 5"),
    ];

    // Mock the summary getter on the queue object
    Object.defineProperty(spotify.player.queue, "summary", {
      get: jest.fn(() => testQueue),
      configurable: true,
    });
  });

  it("returns entire queue with expected number of tracks when not passed argument", async () => {
    const response = await SpotifyQueueVariable.evaluator(
      testTrigger,
      undefined
    );
    expect(Array.isArray(response)).toBe(true);
    expect(response).toHaveLength(5);
  });

  it("returns single track from queue when passed index", async () => {
    for (let i = 0; i < testQueue.length; i++) {
      const response = await SpotifyQueueVariable.evaluator(
        testTrigger,
        `${i}`
      );
      expect(response).toBe(testQueue[i]);
    }
  });

  it("returns field of single track from queue when passed index and field", async () => {
    for (let i = 0; i < testQueue.length; i++) {
      const response = await SpotifyQueueVariable.evaluator(
        testTrigger,
        `${i}.title`
      );
      expect(response).toBe(testQueue[i].title);
    }
  });

  it("returns empty string if index is less than 0", async () => {
    const response = await SpotifyQueueVariable.evaluator(testTrigger, "-1");
    expect(response).toBe("");
  });

  it("returns empty string if index is out of bounds", async () => {
    const response = await SpotifyQueueVariable.evaluator(
      testTrigger,
      `${testQueue.length}`
    );
    expect(response).toBe("");
  });

  it("returns empty string if index is not a number", async () => {
    const response = await SpotifyQueueVariable.evaluator(testTrigger, "a");
    expect(response).toBe("");
  });

  it("returns empty string if passed invalid field", async () => {
    const response = await SpotifyQueueVariable.evaluator(
      testTrigger,
      "0.field"
    );
    expect(response).toBe("");
  });

  it("returns empty array if queue does not exist", async () => {
    Object.defineProperty(spotify.player.queue, "summary", {
      get: jest.fn(() => []),
      configurable: true,
    });
    const response = await SpotifyQueueVariable.evaluator(
      testTrigger,
      undefined
    );
    expect(response).toEqual([]);
  });

  it("returns empty string if index passed when queue does not exist", async () => {
    Object.defineProperty(spotify.player.queue, "summary", {
      get: jest.fn(() => []),
      configurable: true,
    });
    const response = await SpotifyQueueVariable.evaluator(testTrigger, "0");
    expect(response).toBe("");
  });

  it("returns empty string if index and field passed when queue does not exist", async () => {
    Object.defineProperty(spotify.player.queue, "summary", {
      get: jest.fn(() => []),
      configurable: true,
    });
    const response = await SpotifyQueueVariable.evaluator(
      testTrigger,
      "0.title"
    );
    expect(response).toBe("");
  });
});
