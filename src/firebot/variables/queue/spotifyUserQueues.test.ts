import { getTestTrackSummary, testTrigger, testUser } from "@/testData";
import { jest } from "@jest/globals";
import { SpotifyService } from "@/utils/spotify";
import { SpotifyUserQueueEntry } from "@/utils/spotify/player/queue";
import { SpotifyUserQueuesVariable } from "./spotifyUserQueues";

// Mocking the entire @/main module to provide the mocked spotify instance
let testUserQueues: SpotifyUserQueueEntry[];
jest.mock("@/main", () => ({
  spotify: {
    player: {
      queue: {
        getTracksQueuedByUser: jest.fn(),
      },
    },
  },
}));

describe("Spotify - User Queues Replace Variable", () => {
  let spotify: SpotifyService;
  let expectedUsername: string = "oceanity";
  let unexpectedUsername: string = "oceanibot";

  beforeEach(() => {
    // Access the mocked spotify from the mocked @/main module
    spotify = require("@/main").spotify;
    testUserQueues = [
      {
        position: 1,
        queuedBy: expectedUsername,
        track: getTestTrackSummary("track 1"),
        skip: false,
      },
      {
        position: 2,
        queuedBy: expectedUsername,
        track: getTestTrackSummary("track 2"),
        skip: false,
      },
      {
        position: 3,
        queuedBy: expectedUsername,
        track: getTestTrackSummary("track 3"),
        skip: true,
      },
      {
        position: 4,
        queuedBy: unexpectedUsername,
        track: getTestTrackSummary("track 4"),
        skip: true,
      },
      {
        position: 5,
        queuedBy: unexpectedUsername,
        track: getTestTrackSummary("track 5"),
        skip: false,
      },
    ];

    // Mock the summary getter on the queue object
    Object.defineProperty(spotify.player.queue, "userQueues", {
      get: jest.fn(() => testUserQueues),
      configurable: true,
    });

    jest
      .spyOn(spotify.player.queue, "getTracksQueuedByUser")
      .mockImplementation((username?: string) =>
        testUserQueues.filter(
          (queue) => (!username || queue.queuedBy === username) && !queue.skip
        )
      );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns queue of expected number of non-skipped tracks when not passed argument", async () => {
    const response = await SpotifyUserQueuesVariable.evaluator(
      testTrigger,
      undefined
    );

    expect(spotify.player.queue.getTracksQueuedByUser).toHaveBeenCalledTimes(1);
    expect(Array.isArray(response)).toBe(true);
    expect(response).toHaveLength(
      testUserQueues.filter((uq) => !uq.skip).length
    );
  });

  it("returns queue of expected number of non-skipped tracks from specified user when passed username", async () => {
    const response = await SpotifyUserQueuesVariable.evaluator(
      testTrigger,
      expectedUsername
    );

    expect(spotify.player.queue.getTracksQueuedByUser).toHaveBeenCalledTimes(1);
    expect(Array.isArray(response)).toBe(true);
    expect(response).toHaveLength(
      testUserQueues.filter(
        (uq) => uq.queuedBy === expectedUsername && !uq.skip
      ).length
    );

    for (const uq of response) {
      expect(uq.queuedBy).toBe(expectedUsername);
    }
  });

  it("returns empty queue when passed an unexpected username", async () => {
    const response = await SpotifyUserQueuesVariable.evaluator(
      testTrigger,
      "not a real user"
    );

    expect(spotify.player.queue.getTracksQueuedByUser).toHaveBeenCalledTimes(1);
    expect(Array.isArray(response)).toBe(true);
    expect(response).toHaveLength(0);
  });
});
