import { jest } from "@jest/globals";
import { SpotifyService } from "@utils/spotify";
import { testTrack } from "@/testData";
import { getBiggestImageUrl } from "@utils/array";
import { SpotifyTrackService } from "./track";
import { formatMsToTimecode } from "@/utils/string";

describe("Spotify - Track Service", () => {
  let spotify: SpotifyService;
  let track: SpotifyTrackService;

  const defaults = {
    isTrackLoaded: false,
    id: "",
    title: "",
    artist: "",
    artists: [],
    album: "",
    albumArtUrl: "",
    durationMs: -1,
    duration: "0:00",
    positionMs: -1,
    position: "0:00",
    relativePosition: 0,
    url: "",
    uri: "",
  };

  beforeEach(() => {
    spotify = new SpotifyService();
    track = new SpotifyTrackService(spotify);

    jest.spyOn(spotify.events, "trigger").mockImplementation(() => {});
  });

  describe("Getters", () => {
    it("should have default getter values", () => {
      for (const [key, value] of Object.entries(defaults)) {
        if (Array.isArray(value)) {
          expect(track[key as keyof SpotifyTrackService]).toEqual(value);
        } else {
          expect(track[key as keyof SpotifyTrackService]).toBe(value);
        }
      }
    });
  });

  describe("update", () => {
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
      expect(track.albumArtUrl).toBe(
        getBiggestImageUrl(testTrack.album.images)
      );
      expect(track.durationMs).toBe(testTrack.duration_ms);
      expect(track.duration).toBe(formatMsToTimecode(testTrack.duration_ms));
      expect(track.positionMs).toBe(position);
      expect(track.position).toBe(formatMsToTimecode(position));
      expect(track.relativePosition).toBe(position / testTrack.duration_ms);
      expect(track.url).toBe(testTrack.external_urls.spotify);
      expect(track.uri).toBe(testTrack.uri);
    });

    it("should clear current track if passed null", () => {
      track.update(testTrack);
      track.update(null);

      for (const [key, value] of Object.entries(defaults)) {
        if (Array.isArray(value)) {
          expect(track[key as keyof SpotifyTrackService]).toEqual(value);
        } else {
          expect(track[key as keyof SpotifyTrackService]).toBe(value);
        }
      }
    });
  });

  describe("handleNextTick", () => {
    it("should update position", () => {
      const position = 5000;
      track.handleNextTick(position);
      expect(track.positionMs).toBe(position);
      expect(track.position).toBe(formatMsToTimecode(position));
    });

    it("should read -1 if passed null", () => {
      track.handleNextTick(null);
      expect(track.positionMs).toBe(-1);
      expect(track.position).toBe("0:00");
    });
  });

  describe("isTrackUrl", () => {
    it("should return true if track url with parameters", () => {
      let goodUrl =
        "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8?si=ac674684a1d3410c";

      expect(track.isTrackUrl(goodUrl)).toBe(true);
    });

    it("should return true if track url with no parameters", () => {
      let goodUrl = "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8";

      expect(track.isTrackUrl(goodUrl)).toBe(true);
    });

    it("should return true if track url with extraneous whitespace", () => {
      let goodUrl =
        "     https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8?si=ac674684a1d3410c      ";

      expect(track.isTrackUrl(goodUrl)).toBe(true);
    });

    it("should return true if track url with returns at end", () => {
      let goodUrl = "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8\n\n";

      expect(track.isTrackUrl(goodUrl)).toBe(true);
    });

    it("should return false if not a track url", () => {
      let badUrl =
        "https://open.spotify.com/artist/0gxyHStUsqpMadRV0Di1Qt?si=CoN889-pQY-olEHDsrwYEw";

      expect(track.isTrackUrl(badUrl)).toBe(false);
    });

    it("should return false if empty string", () => {
      let badUrl = "";

      expect(track.isTrackUrl(badUrl)).toBe(false);
    });

    it("should return false if null string", () => {
      expect(track.isTrackUrl(undefined)).toBe(false);
    });
  });
});
