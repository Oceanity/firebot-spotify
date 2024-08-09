import { SpotifyService } from "@/utils/spotify";
import { RawSpotifyQueueVariable } from "./rawSpotifyQueue";
import { jest } from "@jest/globals";
import { testQueue, testTrigger } from "@/testData";

// Mocking the entire @/main module to provide the mocked spotify instance
jest.mock("@/main", () => ({
  spotify: {
    player: {
      queue: {
        getAsync: jest.fn(),
      },
    },
  },
}));

describe("Spotify - Raw Queue Replace Variable", () => {
  let spotify: SpotifyService;

  beforeEach(() => {
    spotify = require("@/main").spotify;

    jest
      .spyOn(spotify.player.queue, "getAsync")
      .mockResolvedValue(testQueue);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  it("returns all details on current queue", async () => {
    const response = await RawSpotifyQueueVariable.evaluator(testTrigger);
    expect(response).toEqual(testQueue);
  });

  it("returns empty string when queue is undefined", async () => {
    jest
      .spyOn(spotify.player.queue, "getAsync")
      .mockResolvedValue(null);

    const response = await RawSpotifyQueueVariable.evaluator(testTrigger);
    expect(response).toEqual("");
  });

  it("returns empty string when queue is null", async () => {
    jest
      .spyOn(spotify.player.queue, "getAsync")
      .mockResolvedValue(null);

    const response = await RawSpotifyQueueVariable.evaluator(testTrigger);
    expect(response).toEqual("");
  });
});
