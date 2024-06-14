import { msToFormattedString } from "@utils/strings";
import { getBiggestImageUrl } from "@utils/array";
import { eventManager, logger } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify";
import { EventEmitter } from "events";

export class SpotifyTrackService extends EventEmitter {
  private readonly spotify: SpotifyService;

  private _track?: SpotifyTrackDetails;
  private _progressMs?: number;

  constructor(spotifyService: SpotifyService) {
    super();

    this.spotify = spotifyService;
  }

  public async init() {
    for (const event of ["track-state-changed", "state-cleared"]) {
      this.spotify.player.state.on(event, this.trackChangedHandler);
    }

    this.spotify.player.state.on("tick", this.tickHandler);
  }

  //#region Getters
  public get isTrackLoaded(): boolean {
    return !!this._track;
  }

  public get id(): string {
    return this._track?.id ?? "";
  }

  public get uri(): string {
    return this._track?.uri ?? "";
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

  public get url(): string {
    return this._track?.external_urls.spotify ?? "";
  }

  public get durationMs(): number {
    return this._track?.duration_ms ?? -1;
  }

  public get duration(): string {
    return msToFormattedString(this.durationMs, false);
  }

  public get positionMs(): number {
    return this._progressMs ?? -1;
  }

  public get position(): string {
    return msToFormattedString(this.positionMs, false);
  }

  public get relativePosition(): number {
    if (this.durationMs === -1 || this.positionMs === -1) return 0;

    return this.positionMs / this.durationMs;
  }
  //#endregion

  //#region Event Handlers
  private trackChangedHandler = async (track?: SpotifyTrackDetails) =>
    this.updateTrack(track);

  private tickHandler = (progressMs: number) => this.handleNextTick(progressMs);
  //#endregion

  public async updateTrack(track?: SpotifyTrackDetails): Promise<void> {
    if (this._track?.uri != track?.uri) {
      this._track = track;

      this.emit("track-changed", track);
      eventManager.triggerEvent("oceanity-spotify", "track-changed", { track });
    }
  }

  private async handleNextTick(progressMs?: number) {
    this._progressMs = progressMs;
    this.emit("tick", progressMs);
  }
}
