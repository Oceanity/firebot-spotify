import { jest } from "@jest/globals";
import { SpotifyService } from "@utils/spotify";
import { SpotifyPlaylistService } from "@utils/spotify/player/playlist";
import { testPlaylist } from "@/testData";
import { getBiggestImageUrl } from "@utils/array";

describe("SpotifyPlaylistService", () => {
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

  it("should have default getter values", () => {
    for (const [key, value] of Object.entries(defaults)) {
      expect(playlist[key as keyof SpotifyPlaylistService]).toBe(value);
    }
  });

  it("should fetch playlist by uri", async () => {
    const response = await playlist.fetchByUriAsync(testPlaylist.uri);
    expect(response).toBe(testPlaylist);
  });

  it("should update current playlist", async () => {
    await playlist.updateByUriAsync(testPlaylist.uri);

    expect(playlist.isActive).toBe(true);
    expect(playlist.id).toBe(testPlaylist.id);
    expect(playlist.name).toBe(testPlaylist.name);
    expect(playlist.description).toBe(testPlaylist.description);
    expect(playlist.url).toBe(testPlaylist.href);
    expect(playlist.uri).toBe(testPlaylist.uri);
    expect(playlist.coverImageUrl).toBe(
      getBiggestImageUrl(testPlaylist.images)
    );
    expect(playlist.owner).toBe(testPlaylist.owner.display_name);
    expect(playlist.ownerUrl).toBe(testPlaylist.owner.href);
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
