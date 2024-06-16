import { jest } from "@jest/globals";
import { SpotifyService } from "@utils/spotify";
import { testQueue } from "@/testData";
import { SpotifyStateService } from "./state";

describe("Spotify - State Service", () => {
  let spotify: SpotifyService;
  let state: SpotifyStateService;

  beforeEach(() => {
    spotify = new SpotifyService();
    state = new SpotifyStateService(spotify);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should have default state values", () => {
    expect(true).toBe(true);
  });
});
