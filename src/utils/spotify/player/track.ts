import { formatMsToTimecode } from "@/utils/string";
import { getBiggestImageUrl } from "@utils/array";
import { SpotifyService } from "@utils/spotify";
import { EventEmitter } from "events";

export type SpotifyTrackSummary = {
  title: string;
  artist: string;
  artists: string[];
  album: string;
  albumArtUrl: string;
  durationMs: number;
  duration: string;
};

export type SpotifyTrackSummaryWithPosition = SpotifyTrackSummary & {
  positionMs: number;
  position: string;
  relativePosition: number;
};

export class SpotifyTrackService extends EventEmitter {
  private readonly spotify: SpotifyService;

  private _track?: SpotifyTrackDetails;
  private _trackSummary?: SpotifyTrackSummary;
  private _progressMs: number = -1;

  constructor(spotifyService: SpotifyService) {
    super();

    this.spotify = spotifyService;
  }

  public async init() {
    for (const event of ["track-changed", "state-cleared"]) {
      this.spotify.player.state.on(
        event,
        async (track?: SpotifyTrackDetails) => {
          this.update(track);
        }
      );
    }

    this.spotify.player.state.on("tick", (progressMs: number) => {
      this.handleNextTick(progressMs);
    });
  }

  //#region Getters
  public get raw(): SpotifyTrackDetails | null {
    return this._track ?? null;
  }

  public get summary(): SpotifyTrackSummaryWithPosition | null {
    return this._trackSummary
      ? {
          ...this._trackSummary,
          positionMs: this._progressMs,
          position: formatMsToTimecode(this._progressMs),
          relativePosition: this._progressMs / this._trackSummary.durationMs,
        }
      : null;
  }

  public get isTrackLoaded(): boolean {
    return !!this._track;
  }

  public get id(): string {
    return this._track?.id ?? "";
  }

  public get title(): string {
    return this._track?.name ?? "";
  }

  public get artists(): string[] {
    return this._track?.artists.map((artist) => artist.name) ?? [];
  }

  public get artist(): string {
    return this.artists[0] ?? "";
  }

  public get album(): string {
    return this._track?.album.name ?? "";
  }

  public get albumArtUrl(): string {
    return getBiggestImageUrl(this._track?.album.images ?? []);
  }

  public get durationMs(): number {
    return this._track?.duration_ms ?? -1;
  }

  public get duration(): string {
    return formatMsToTimecode(this.durationMs);
  }

  public get positionMs(): number {
    return this._progressMs ?? -1;
  }

  public get position(): string {
    return formatMsToTimecode(this.positionMs);
  }

  public get relativePosition(): number {
    if (this.durationMs === -1 || this.positionMs === -1) return 0;

    return this.positionMs / this.durationMs;
  }

  public get url(): string {
    return this._track?.external_urls.spotify ?? "";
  }

  public get uri(): string {
    return this._track?.uri ?? "";
  }
  //#endregion

  public update(track?: SpotifyTrackDetails): void {
    if (this._track?.uri != track?.uri) {
      this._track = track;
      this._trackSummary = trackSummaryFromDetails(track) ?? undefined;
    }
  }

  public async handleNextTick(progressMs?: number) {
    this._progressMs = progressMs ?? 0;
  }
}

export function trackSummaryFromDetails(
  track?: SpotifyTrackDetails
): SpotifyTrackSummary | null {
  if (!track) return null;

  return Object.freeze({
    title: track.name,
    artist: track.artists[0].name,
    artists: track.artists.map((a) => a.name),
    album: track.album.name,
    albumArtUrl: getBiggestImageUrl(track.album.images),
    durationMs: track.duration_ms,
    duration: formatMsToTimecode(track.duration_ms),
  });
}
