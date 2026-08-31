import "@/mocks/firebot";
import { jest } from "@jest/globals";
import { SpotifyService } from "@utils/spotify";
import { SpotifyPlaylistService } from "@utils/spotify/player/playlist";
import { testPlaylist } from "@/testData";
import { getBiggestImageUrl } from "@utils/array";
import ResponseError from "@/models/responseError";
import { logger } from "@oceanity/firebot-helpers/firebot";

describe("Spotify - Playlist Service", () => {
  let spotify: SpotifyService;
  let playlist: SpotifyPlaylistService;

  const defaults = {
    isActive: false,
    id: "",
    name: "",
    description: "",
    url: "",
    uri: "",
    coverImageUrl: "",
    owner: "",
    ownerUrl: "",
    length: -1,
  };

  beforeEach(() => {
    spotify = new SpotifyService();
    playlist = new SpotifyPlaylistService(spotify);

    jest.spyOn(spotify.api, "fetch").mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 200,
        data: testPlaylist,
      })
    );

    jest.spyOn(spotify.events, "trigger").mockImplementation(() => {});
  });

  describe("Getters", () => {
    it("has default getter values", () => {
      for (const [key, value] of Object.entries(defaults)) {
        expect(playlist[key as keyof SpotifyPlaylistService]).toBe(value);
      }
    });
  });

  describe("fetchByUriAsync", () => {
    it("should fetch playlist by uri", async () => {
      const response = await playlist.fetchByUriAsync(testPlaylist.uri);
      expect(response).toBe(testPlaylist);
    });
  });

  describe("updateByUriAsync", () => {
    it("should update current playlist", async () => {
      await playlist.updateByUriAsync(testPlaylist.uri);

      expect(playlist.isActive).toBe(true);
      expect(playlist.id).toBe(testPlaylist.id);
      expect(playlist.name).toBe(testPlaylist.name);
      expect(playlist.description).toBe(testPlaylist.description);
      expect(playlist.url).toBe(testPlaylist.external_urls.spotify);
      expect(playlist.uri).toBe(testPlaylist.uri);
      expect(playlist.coverImageUrl).toBe(
        getBiggestImageUrl(testPlaylist.images)
      );
      expect(playlist.owner).toBe(testPlaylist.owner.display_name);
      expect(playlist.ownerUrl).toBe(testPlaylist.owner.external_urls.spotify);
      expect(playlist.length).toBe(testPlaylist.tracks.total);
    });

    it("should clear playlist if null is passed through update", async () => {
      // fill playlist to ensure null update actually has to do something
      await playlist.updateByUriAsync(testPlaylist.uri);

      await playlist.updateByUriAsync(null);

      for (const [key, value] of Object.entries(defaults)) {
        expect(playlist[key as keyof SpotifyPlaylistService]).toBe(value);
      }
    });
  });

  describe("playlists Spotify won't serve", () => {
    // Spotify's own editorial and algorithmic playlists have 404'd since Nov 2024
    const editorialUri = "spotify:playlist:37i9dQZF1DX5wDmLW735Yd";

    const notFound = () =>
      Promise.reject(
        new ResponseError(
          "Spotify API /playlists/37i9dQZF1DX5wDmLW735Yd returned status 404",
          { status: 404 }
        )
      );

    it("treats a 404 playlist as no playlist rather than throwing", async () => {
      jest.spyOn(spotify.api, "fetch").mockImplementation(notFound);

      await expect(
        playlist.updateByUriAsync(editorialUri)
      ).resolves.toBeUndefined();

      for (const [key, value] of Object.entries(defaults)) {
        expect(playlist[key as keyof SpotifyPlaylistService]).toBe(value);
      }
      expect(playlist.raw).toBe(null);
    });

    it("clears a previously populated playlist", async () => {
      await playlist.updateByUriAsync(testPlaylist.uri);
      expect(playlist.isActive).toBe(true);

      jest.spyOn(spotify.api, "fetch").mockImplementation(notFound);
      await playlist.updateByUriAsync(editorialUri);

      expect(playlist.isActive).toBe(false);
      expect(playlist.raw).toBe(null);
    });

    it("only asks Spotify once", async () => {
      const fetchMock = jest
        .spyOn(spotify.api, "fetch")
        .mockImplementation(notFound);

      await playlist.updateByUriAsync(editorialUri);
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // Re-entering the same playlist must not start the storm again
      for (let i = 0; i < 5; i++) {
        await playlist.updateByUriAsync(editorialUri);
      }
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("still fetches other playlists", async () => {
      const fetchMock = jest
        .spyOn(spotify.api, "fetch")
        .mockImplementation(notFound);

      await playlist.updateByUriAsync(editorialUri);

      fetchMock.mockReturnValue(
        Promise.resolve({ ok: true, status: 200, data: testPlaylist })
      );
      await playlist.updateByUriAsync(testPlaylist.uri);

      expect(playlist.isActive).toBe(true);
      expect(playlist.name).toBe(testPlaylist.name);
    });

    it("propagates failures that aren't a 404", async () => {
      jest
        .spyOn(spotify.api, "fetch")
        .mockImplementation(() =>
          Promise.reject(
            new ResponseError("Spotify API returned status 500", {
              status: 500,
            })
          )
        );

      await expect(playlist.updateByUriAsync(editorialUri)).rejects.toThrow();
    });
  });

  describe("init", () => {
    it("handles a failing fetch instead of leaking an unhandled rejection", async () => {
      await playlist.init();

      jest
        .spyOn(spotify.api, "fetch")
        .mockImplementation(() => Promise.reject(new Error("boom")));

      // EventEmitter does not await handlers, so the handler must catch its own
      expect(() =>
        spotify.player.state.emit(
          "playlist-state-changed",
          "spotify:playlist:abc"
        )
      ).not.toThrow();

      // Let the handler's rejection settle
      await new Promise(process.nextTick);

      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining("Error updating Spotify playlist"),
        expect.any(Error)
      );
    });
  });
});
