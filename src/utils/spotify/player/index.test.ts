import "@/mocks/firebot";
import { jest } from "@jest/globals";
import SpotifyPlayerService from ".";
import { SpotifyService } from "..";
import { logger } from "@/utils/firebot";

describe("Spotify - Player Service", () => {
  let spotify: SpotifyService;
  let player: SpotifyPlayerService;

  beforeEach(() => {
    spotify = new SpotifyService();
    player = new SpotifyPlayerService(spotify);

    jest.spyOn(spotify.api, "fetch").mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 200,
        data: {
          is_playing: true,
          volume_percent: 50,
        },
      })
    );
  });

  describe("Getters", () => {
    it("should have default getter values", () => {
      expect(player.isPlaying).toBe(false);
      expect(player.volume).toBe(-1);
      expect(player.volumeWasManuallyChanged).toBe(false);
    });
  });

  //#region playAsync
  describe("playAsync", () => {
    beforeEach(() => {
      Object.defineProperty(player, "isPlaying", {
        value: false,
        writable: true,
      });
    });

    it("should play if not playing", async () => {
      await player.playAsync();

      expect(spotify.api.fetch).toHaveBeenCalledTimes(1);
      expect(spotify.api.fetch).toHaveBeenCalledWith(
        "/me/player/play",
        "PUT",
        expect.any(Object)
      );
    });

    it("should not play if playing", async () => {
      Object.defineProperty(player, "isPlaying", {
        value: true,
      });

      await player.playAsync();

      expect(spotify.api.fetch).toHaveBeenCalledTimes(0);
    });

    it("should throw if cannot connect", async () => {
      jest
        .spyOn(spotify.api, "fetch")
        .mockReturnValue(
          Promise.resolve({ ok: false, status: 502, data: null })
        );

      await expect(player.playAsync()).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error)
      );
    });

    it("should throw if unauthorized", async () => {
      jest
        .spyOn(spotify.api, "fetch")
        .mockReturnValue(
          Promise.resolve({ ok: false, status: 401, data: null })
        );

      await expect(player.playAsync()).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error)
      );
    });

    it("should throw if not premium", async () => {
      jest
        .spyOn(spotify.api, "fetch")
        .mockReturnValue(
          Promise.resolve({ ok: false, status: 403, data: null })
        );

      await expect(player.playAsync()).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error)
      );
    });
  });
  //#endregion

  //#region pauseAsync
  describe("pauseAsync", () => {
    beforeEach(() => {
      Object.defineProperty(player, "isPlaying", {
        value: true,
        writable: true,
      });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should pause if playing", async () => {
      await player.pauseAsync();

      expect(spotify.api.fetch).toHaveBeenCalledTimes(1);
      expect(spotify.api.fetch).toHaveBeenCalledWith(
        "/me/player/pause",
        "PUT",
        expect.any(Object)
      );
    });

    it("should not pause if paused", async () => {
      Object.defineProperty(player, "isPlaying", {
        value: false,
      });

      await player.pauseAsync();

      expect(spotify.api.fetch).toHaveBeenCalledTimes(0);
    });

    it("should throw if cannot connect", async () => {
      jest
        .spyOn(spotify.api, "fetch")
        .mockReturnValue(
          Promise.resolve({ ok: false, status: 502, data: null })
        );

      await expect(player.pauseAsync()).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error)
      );
    });

    it("should throw if unauthorized", async () => {
      jest
        .spyOn(spotify.api, "fetch")
        .mockReturnValue(
          Promise.resolve({ ok: false, status: 401, data: null })
        );

      await expect(player.pauseAsync()).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error)
      );
    });

    it("should throw if not premium", async () => {
      jest
        .spyOn(spotify.api, "fetch")
        .mockReturnValue(
          Promise.resolve({ ok: false, status: 403, data: null })
        );

      await expect(player.pauseAsync()).rejects.toThrow();

      expect(logger.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(Error)
      );
    });
  });
  //#endregion
});
