import { formatMsToTimecode } from "@oceanity/firebot-helpers/string";
import { getBiggestImageUrl } from "@utils/array";
import { SpotifyService } from "@utils/spotify";
import { EventEmitter } from "events";

export class SpotifyTrackService extends EventEmitter {
  private readonly spotify: SpotifyService;
  private readonly urlRegex: RegExp =
    /(?:https?:)\/\/open\.spotify\.com\/(?:intl-[a-z]+\/)?track\/(.+?)(?:\?.+)?(?:\W|$)/;

  private _track?: SpotifyTrackDetails | null;
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
          queuedBy: this.spotify.player.queue.queuedBy ?? "",
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

  public update(track?: SpotifyTrackDetails | null): void {
    if (this._track?.uri != track?.uri) {
      this._track = track;
      this._trackSummary = trackSummaryFromDetails(track) ?? undefined;
    }
  }

  public async handleNextTick(progressMs?: number | null) {
    this._progressMs = progressMs ?? -1;
  }

  public isTrackUrl = (input?: string): boolean =>
    input ? this.urlRegex.test(input.trim()) : false;

  public getIdFromTrackUrl(input: string): string | null {
    const matches = input.trim().match(this.urlRegex);
    return matches ? matches[1] : null;
  }
}

export function trackSummaryFromDetails(
  track?: SpotifyTrackDetails | null
): SpotifyTrackSummary | null {
  if (!track) return null;

  return Object.freeze({
    id: track.id,
    title: track.name,
    artist: track.artists[0].name,
    artists: track.artists.map((a) => a.name),
    album: track.album.name,
    albumArtUrl: getBiggestImageUrl(track.album.images),
    durationMs: track.duration_ms,
    duration: formatMsToTimecode(track.duration_ms),
    url: track.external_urls.spotify,
    uri: track.uri,
  });
}
