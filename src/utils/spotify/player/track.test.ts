import { jest } from "@jest/globals";
import { SpotifyService } from "@utils/spotify";
import { testTrack } from "@/testData";
import { getBiggestImageUrl } from "@utils/array";
import { SpotifyTrackService } from "./track";
import { formatMsToTimecode } from "@/utils/string";

describe("Spotify - Track Service", () => {
  let spotify: SpotifyService;
  let track: SpotifyTrackService;

  beforeEach(() => {
    spotify = new SpotifyService();
    track = new SpotifyTrackService(spotify);

    jest.spyOn(spotify.events, "trigger").mockImplementation(() => {});
  });

  it("should have default getter values", () => {
    expect(track.isTrackLoaded).toBe(false);
    expect(track.id).toBe("");
    expect(track.title).toBe("");
    expect(track.artist).toBe("");
    expect(track.artists).toEqual([]);
    expect(track.album).toBe("");
    expect(track.albumArtUrl).toBe("");
    expect(track.durationMs).toBe(-1);
    expect(track.duration).toBe("0:00");
    expect(track.positionMs).toBe(-1);
    expect(track.position).toBe("0:00");
    expect(track.relativePosition).toBe(0);
    expect(track.url).toBe("");
    expect(track.uri).toBe("");
  });

  it("should update current track", async () => {
    const position = 5000;

    track.update(testTrack);
    track.handleNextTick(position);

    expect(track.isTrackLoaded).toBe(true);
    expect(track.id).toBe(testTrack.id);
    expect(track.title).toBe(testTrack.name);
    expect(track.artist).toBe(testTrack.artists[0].name);
    expect(track.artists).toEqual(
      testTrack.artists.map((artist) => artist.name)
    );
    expect(track.album).toBe(testTrack.album.name);
    expect(track.albumArtUrl).toBe(getBiggestImageUrl(testTrack.album.images));
    expect(track.durationMs).toBe(testTrack.duration_ms);
    expect(track.duration).toBe(formatMsToTimecode(testTrack.duration_ms));
    expect(track.positionMs).toBe(position);
    expect(track.position).toBe(formatMsToTimecode(position));
    expect(track.relativePosition).toBe(position / testTrack.duration_ms);
    expect(track.url).toBe(testTrack.external_urls.spotify);
    expect(track.uri).toBe(testTrack.uri);
  });
});
