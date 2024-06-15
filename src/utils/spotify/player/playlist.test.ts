import { jest } from "@jest/globals";
import { SpotifyService } from "@utils/spotify";
import { SpotifyPlaylistService } from "@utils/spotify/player/playlist";
import { testPlaylist } from "@/testData";
import { getBiggestImageUrl } from "@utils/array";

describe("SpotifyDeviceService", () => {
  let spotify: SpotifyService;
  let playlist: SpotifyPlaylistService;

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
    expect(playlist.isActive).toBe(false);
    expect(playlist.id).toBe("");
    expect(playlist.name).toBe("");
    expect(playlist.description).toBe("");
    expect(playlist.url).toBe("");
    expect(playlist.uri).toBe("");
    expect(playlist.coverImageUrl).toBe("");
    expect(playlist.owner).toBe("");
    expect(playlist.ownerUrl).toBe("");
    expect(playlist.length).toBe(-1);
  });

  it("should fetch playlist by uri", async () => {
    const response = await playlist.fetchByUriAsync(testPlaylist.uri);
    expect(response).toBe(testPlaylist);
  });

  it("should update current playlist", async () => {
    playlist.update(testPlaylist);

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
});
