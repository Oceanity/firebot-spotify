import {
  getTestPlaylistSummary,
  getTestTrackSummary,
  testTrigger,
} from "@/testData";
import { SpotifyPlaylistVariable } from "./spotifyPlaylist";
import { jest } from "@jest/globals";
import { SpotifyService } from "@/utils/spotify";

// Mocking the entire @/main module to provide the mocked spotify instance
jest.mock("@/main", () => ({
  spotify: {
    player: {
      playlist: {},
    },
    events: {
      trigger: jest.fn(),
    },
  },
}));

describe("Spotify - Playlist Replace Variable", () => {
  let spotify: SpotifyService;
  let testPlaylist: SpotifyPlaylistSummary;

  beforeEach(() => {
    // Access the mocked spotify from the mocked @/main module
    spotify = require("@/main").spotify;

    testPlaylist = getTestPlaylistSummary("my playlist");
    testPlaylist.tracks = [
      getTestTrackSummary("track 1"),
      getTestTrackSummary("track 2"),
      getTestTrackSummary("track 3"),
      getTestTrackSummary("track 4"),
      getTestTrackSummary("track 5"),
    ];

    // Mock the summary getter on the queue object
    Object.defineProperty(spotify.player.playlist, "summary", {
      get: jest.fn(() => testPlaylist),
      configurable: true,
    });
  });

  it("returns playlist with expected number of tracks when not passed argument", async () => {
    const response = await SpotifyPlaylistVariable.evaluator(
      testTrigger,
      undefined
    );
    expect(response).toEqual(testPlaylist);
    expect(response.tracks).toHaveLength(testPlaylist.tracks.length);
  });

  it("returns field of playlist when passed field", async () => {
    const response = await SpotifyPlaylistVariable.evaluator(
      testTrigger,
      "name"
    );
    expect(response).toBe(testPlaylist.name);
  });

  it("returns empty string when passed invalid field", async () => {
    const response = await SpotifyPlaylistVariable.evaluator(
      testTrigger,
      "invalid"
    );
    expect(response).toBe("");
  });

  it("returns tracks of playlist when passed tracks", async () => {
    const response = await SpotifyPlaylistVariable.evaluator(
      testTrigger,
      "tracks"
    );
    expect(response).toBe(testPlaylist.tracks);
    expect(response).toHaveLength(testPlaylist.tracks.length);
  });

  it("returns expected track of playlist when passed tracks and index", async () => {
    for (let i = 0; i < testPlaylist.tracks.length; i++) {
      const response = await SpotifyPlaylistVariable.evaluator(
        testTrigger,
        `tracks.${i}`
      );

      expect(response).toBe(testPlaylist.tracks[i]);
      expect(response.title).toBe(testPlaylist.tracks[i].title);
    }
  });

  it("returns null when passed tracks and index less than 0", async () => {
    const response = await SpotifyPlaylistVariable.evaluator(
      testTrigger,
      "tracks.-1"
    );
    expect(response).toBe(null);
  });

  it("returns null when passed tracks and index out of bounds", async () => {
    const response = await SpotifyPlaylistVariable.evaluator(
      testTrigger,
      `tracks.${testPlaylist.tracks.length}`
    );
    expect(response).toBe(null);
  });

  it("returns track field when passed tracks, index and field", async () => {
    const response = await SpotifyPlaylistVariable.evaluator(
      testTrigger,
      "tracks.0.title"
    );
    expect(response).toBe(testPlaylist.tracks[0].title);
  });

  it("returns empty string when passed tracks, index and invalid field", async () => {
    const response = await SpotifyPlaylistVariable.evaluator(
      testTrigger,
      "tracks.0.invalid"
    );
    expect(response).toBe("");
  });
});
