import { SpotifyService } from "@utils/spotify";
import { jest } from "@jest/globals";

describe("SpotifyService", () => {
  let spotify: SpotifyService;

  const emptySearchCategory = <T>(): SpotifySearchCategory<T> => ({
    href: "",
    limit: 1,
    next: "",
    offset: 0,
    previous: "",
    total: 0,
    items: [],
  });

  let searchResponse: SpotifySearchResponse;

  beforeEach(() => {
    spotify = new SpotifyService();
  });

  it("search returns search response", async () => {
    searchResponse = {
      tracks: emptySearchCategory<SpotifyTrackDetails>(),
      artists: emptySearchCategory<SpotifyArtistDetails>(),
      albums: emptySearchCategory<SpotifyAlbumDetails>(),
      audiobooks: emptySearchCategory<SpotifyAudiobookDetails>(),
      playlists: emptySearchCategory<SpotifyPlaylistDetails>(),
      shows: emptySearchCategory<SpotifyShowDetails>(),
      episodes: emptySearchCategory<SpotifyEpisodeDetails>(),
    };

    jest
      .spyOn(spotify, "searchAsync")
      .mockReturnValue(Promise.resolve(searchResponse));

    const response = await spotify.searchAsync("testing", "track");

    expect(response).toBe(searchResponse);
  });
});
