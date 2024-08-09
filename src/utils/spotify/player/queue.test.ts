import { jest } from "@jest/globals";
import { SpotifyService } from "@utils/spotify";
import { testQueue } from "@/testData";
import { SpotifyQueueService } from "./queue";

describe("Spotify - Queue Service", () => {
  let spotify: SpotifyService;
  let queue: SpotifyQueueService;

  beforeEach(() => {
    spotify = new SpotifyService();
    queue = new SpotifyQueueService(spotify);

    jest.spyOn(spotify.events, "trigger").mockImplementation(() => {});

    jest.spyOn(spotify.api, "fetch").mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 200,
        data: testQueue,
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAsync", () => {
    it("gets current queue", async () => {
      const response = await queue.getAsync();

      expect(response).not.toBeNull();

      expect(response?.currently_playing.name).toBe(
        testQueue.currently_playing.name
      );
      expect(response?.queue.length).toBe(testQueue.queue.length);

      for (let i = 0; i < testQueue.queue.length; i++) {
        expect(response?.queue[i].id).toBe(testQueue.queue[i].id);
      }
    });
  });

  describe("findIndexAsync", () => {
    it("gets correct index of currently playing track", async () => {
      const response = await queue.findIndexAsync(
        testQueue.currently_playing.uri
      );
      expect(response).toBe(0);
    });

    it("gets correct index of queued tracks", async () => {
      for (let i = 1; i <= testQueue.queue.length; i++) {
        const response = await queue.findIndexAsync(testQueue.queue[i - 1].uri);
        expect(response).toBe(i);
      }
    });

    it("returns -1 if not found", async () => {
      const response = await queue.findIndexAsync("not found");
      expect(response).toBe(-1);
    });
  });
});
