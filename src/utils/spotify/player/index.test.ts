import SpotifyPlayerService from ".";
import { SpotifyService } from "..";

describe("SpotifyPlayerService", () => {
  let spotify: SpotifyService;
  let player: SpotifyPlayerService;

  beforeEach(() => {
    spotify = new SpotifyService();
    player = new SpotifyPlayerService(spotify);
  });

  it("should have default getter values", () => {
    expect(player.isPlaying).toBe(false);
    expect(player.volume).toBe(-1);
    expect(player.volumeWasManuallyChanged).toBe(false);
  });
});
