import { jest } from "@jest/globals";
import { SpotifyService } from "@utils/spotify";
import { testTrack } from "@/testData";
import { getBiggestImageUrl } from "@utils/array";
import { SpotifyTrackService } from "./track";
import { formatMsToTimecode } from "@oceanity/firebot-helpers/string";

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
    it("has default getter values", () => {
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
    it("updates position", () => {
      const position = 5000;
      track.handleNextTick(position);
      expect(track.positionMs).toBe(position);
      expect(track.position).toBe(formatMsToTimecode(position));
    });

    it("sets positionMs to -1 if passed null", () => {
      track.handleNextTick(null);
      expect(track.positionMs).toBe(-1);
      expect(track.position).toBe("0:00");
    });
  });

  describe("isTrackUrl", () => {
    it("returns true if track url with parameters", () => {
      let goodUrl =
        "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8?si=ac674684a1d3410c";

      expect(track.isTrackUrl(goodUrl)).toBe(true);
    });

    it("returns true if track url with no parameters", () => {
      let goodUrl = "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8";

      expect(track.isTrackUrl(goodUrl)).toBe(true);
    });

    it("returns true if track url with international link", () => {
      let goodUrl = "https://open.spotify.com/intl-ja/track/6EdXJoSUjYU3wotVjhDcKl?si=cce7b8dc26754566";

      expect(track.isTrackUrl(goodUrl)).toBe(true);
    });

    it("returns true if track url with extraneous whitespace", () => {
      let goodUrl =
        "     https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8?si=ac674684a1d3410c      ";

      expect(track.isTrackUrl(goodUrl)).toBe(true);
    });

    it("returns true if track url with returns at end", () => {
      let goodUrl = "https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8\n\n";

      expect(track.isTrackUrl(goodUrl)).toBe(true);
    });

    it("returns false if not a track url", () => {
      let badUrl =
        "https://open.spotify.com/artist/0gxyHStUsqpMadRV0Di1Qt?si=CoN889-pQY-olEHDsrwYEw";

      expect(track.isTrackUrl(badUrl)).toBe(false);
    });

    it("returns false if empty string", () => {
      let badUrl = "";

      expect(track.isTrackUrl(badUrl)).toBe(false);
    });

    it("returns false if null string", () => {
      expect(track.isTrackUrl(undefined)).toBe(false);
    });
  });

  describe("getIdFromTrackUrl", () => {
    it("returns id from track url", () => {
      const id = "4PTG3Z6ehGkBFwjybzWkR8";
      const url = `https://open.spotify.com/track/${id}`;

      expect(track.getIdFromTrackUrl(url)).toBe(id);
    });

    it("returns id from track url with international link", () => {
      const id = "4PTG3Z6ehGkBFwjybzWkR8";
      const url = `https://open.spotify.com/intl-ja/track/${id}`;
      
      expect(track.getIdFromTrackUrl(url)).toBe(id);
    });

    it("returns null when url is not a track url", () => {
      const id = "4PTG3Z6ehGkBFwjybzWkR8";
      const url = `https://open.spotify.com/artist/${id}`;

      expect(track.getIdFromTrackUrl(url)).toBe(null);
    });

    it("returns null if input is a non-Url string", () => {
      const input = "this is not a url";

      expect(track.getIdFromTrackUrl(input)).toBe(null);
    });
  });
});
