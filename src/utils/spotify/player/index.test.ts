import SpotifyPlayerService from ".";
import { SpotifyService } from "..";

describe("Spotify - Player Service", () => {
  let spotify: SpotifyService;
  let player: SpotifyPlayerService;

  beforeEach(() => {
    spotify = new SpotifyService();
    player = new SpotifyPlayerService(spotify);
  });

  describe("Getters", () => {
    it("should have default getter values", () => {
      expect(player.isPlaying).toBe(false);
      expect(player.volume).toBe(-1);
      expect(player.volumeWasManuallyChanged).toBe(false);
    });
  });

  describe("playAsync", () => {
    it("should play", async () => {
      await player.playAsync(); // TODO
    });
  });
});
