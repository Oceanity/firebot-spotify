import { jest } from "@jest/globals";
import { SpotifyService } from "@utils/spotify";
import { SpotifyStateService } from "./state";

describe("Spotify - State Service", () => {
  let spotify: SpotifyService;
  let state: SpotifyStateService;

  beforeEach(() => {
    spotify = new SpotifyService();
    state = new SpotifyStateService(spotify);

    jest
      .spyOn(state, "updatePlaybackStateAsync")
      .mockImplementation(() => Promise.resolve());
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("init", () => {
    it("shouldn't be ready on construction", () => {
      expect(state.isReady).toBe(false);
    });

    it("should be ready on initialization", async () => {
      await state.init();
      expect(state.isReady).toBe(true);
    });
  });
});
