import "@/mocks/firebot";
import { jest } from "@jest/globals";
import { SpotifyService } from "@utils/spotify";
import { SpotifyStateService } from "./state";
import { testTrack } from "@/testData";
import ResponseError from "@/models/responseError";

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

  describe("playlist context tracking", () => {
    const playerStateWithContextUri = (uri: string | null) =>
      ({
        device: { volume_percent: 50 },
        is_playing: true,
        progress_ms: 0,
        item: testTrack,
        context: uri
          ? {
              external_urls: { spotify: "https://open.spotify.com/playlist/x" },
              href: "https://api.spotify.com/v1/playlists/x",
              type: "playlist",
              uri,
            }
          : null,
      } as unknown as SpotifyPlayer);

    let playlistStateChanged: jest.Mock;

    /**
     * Runs the real update once per call. `tick` is stubbed out because it
     * otherwise reschedules itself forever.
     */
    const poll = async (times: number) => {
      for (let i = 0; i < times; i++) {
        await state.updatePlaybackStateAsync();
      }
    };

    beforeEach(() => {
      // Use the real implementation, the outer beforeEach stubs it out
      jest.spyOn(state, "updatePlaybackStateAsync").mockRestore();
      jest
        .spyOn(state as any, "tick")
        .mockImplementation(() => Promise.resolve());
      jest.spyOn(spotify.auth, "isLinked", "get").mockReturnValue(true);

      playlistStateChanged = jest.fn();
      state.on("playlist-state-changed", playlistStateChanged);
    });

    it("emits once for an unchanged playlist, however many times we poll", async () => {
      jest.spyOn(spotify.api, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
        data: playerStateWithContextUri("spotify:playlist:abc"),
      } as any);

      await poll(10);

      // Regression: this used to re-emit every poll whenever the playlist
      // fetch failed, hammering Spotify at 1Hz until it rate limited us
      expect(playlistStateChanged).toHaveBeenCalledTimes(1);
      expect(playlistStateChanged).toHaveBeenCalledWith("spotify:playlist:abc");
    });

    it("emits again when the playlist actually changes", async () => {
      const fetchMock = jest.spyOn(spotify.api, "fetch");

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        data: playerStateWithContextUri("spotify:playlist:abc"),
      } as any);
      await poll(3);

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        data: playerStateWithContextUri("spotify:playlist:xyz"),
      } as any);
      await poll(3);

      expect(playlistStateChanged).toHaveBeenCalledTimes(2);
      expect(playlistStateChanged).toHaveBeenLastCalledWith(
        "spotify:playlist:xyz"
      );
    });

    it("emits null once when playback leaves a playlist", async () => {
      const fetchMock = jest.spyOn(spotify.api, "fetch");

      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        data: playerStateWithContextUri("spotify:playlist:abc"),
      } as any);
      await poll(2);

      // Playing from an album or search results carries no playlist context
      fetchMock.mockResolvedValue({
        ok: true,
        status: 200,
        data: playerStateWithContextUri(null),
      } as any);
      await poll(5);

      expect(playlistStateChanged).toHaveBeenCalledTimes(2);
      expect(playlistStateChanged).toHaveBeenLastCalledWith(null);
    });

    it("stays quiet when there is no playlist context at all", async () => {
      jest.spyOn(spotify.api, "fetch").mockResolvedValue({
        ok: true,
        status: 200,
        data: playerStateWithContextUri(null),
      } as any);

      await poll(5);

      expect(playlistStateChanged).not.toHaveBeenCalled();
    });

    describe("wired to the playlist service", () => {
      // Spotify has 404'd its own editorial playlists since Nov 2024
      const editorialUri = "spotify:playlist:37i9dQZF1DX5wDmLW735Yd";

      it("asks for an unavailable playlist once, not once per poll", async () => {
        const fetchMock = jest
          .spyOn(spotify.api, "fetch")
          .mockImplementation((endpoint: string) => {
            if (endpoint.startsWith("/playlists/")) {
              return Promise.reject(
                new ResponseError(
                  `Spotify API ${endpoint} returned status 404`,
                  { status: 404 }
                )
              );
            }
            return Promise.resolve({
              ok: true,
              status: 200,
              data: playerStateWithContextUri(editorialUri),
            }) as any;
          });

        // The playlist service listens to the player's own state service, so
        // drive that one rather than the standalone instance above
        const wiredState = spotify.player.state;
        jest
          .spyOn(wiredState as any, "tick")
          .mockImplementation(() => Promise.resolve());

        await spotify.player.playlist.init();

        for (let i = 0; i < 30; i++) {
          await wiredState.updatePlaybackStateAsync();
        }
        // Let the playlist handler's promises settle
        await new Promise(process.nextTick);

        const playlistCalls = fetchMock.mock.calls.filter(([endpoint]) =>
          String(endpoint).startsWith("/playlists/")
        );

        // This is the reported bug: 30 polls used to mean 30 requests, which
        // ran at 1Hz for 85 minutes and got the integration rate limited
        expect(playlistCalls).toHaveLength(1);
        expect(spotify.player.playlist.isActive).toBe(false);
      });
    });
  });
});
