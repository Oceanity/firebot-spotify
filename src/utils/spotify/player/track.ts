import { msToFormattedString } from "@utils/strings";
import { getBiggestImageUrl } from "@utils/array";
import { eventManager } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify";
import { EventEmitter } from "events";

export class SpotifyTrackService extends EventEmitter {
  private readonly spotify: SpotifyService;

  private _track?: SpotifyTrackDetails;

  constructor(spotify: SpotifyService) {
    super();

    this.spotify = spotify;

    for (const event of ["track-state-changed", "state-cleared"]) {
      this.spotify.player.state.on(event, this.trackChangedHandler);
    }
  }

  //#region Getters
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
    return msToFormattedString(this._track?.duration_ms ?? -1, false);
  }
  //#endregion

  //#region Event Handlers
  private trackChangedHandler = async (track?: SpotifyTrackDetails) =>
    this.updateTrack(track);
  //#endregion

  public async updateTrack(track?: SpotifyTrackDetails): Promise<void> {
    if (this._track?.uri != track?.uri) {
      this._track = track;

      this.emit("track-changed", track);
      eventManager.triggerEvent("oceanity-spotify", "track-changed", { track });
    }
  }
}
