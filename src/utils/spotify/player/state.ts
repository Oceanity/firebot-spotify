import { logger } from "@oceanity/firebot-helpers/firebot";
import { delay, now } from "@utils/time";
import { SpotifyService } from "@utils/spotify";
import { EventEmitter } from "events";
import RateLimitedError from "@/models/rateLimitedError";

export class SpotifyStateService extends EventEmitter {
  private readonly spotify: SpotifyService;

  private _progressMs: number = 0;
  private _isReady: boolean = false;

  /**
   * Uri of the playlist context Spotify last reported, tracked here rather than
   * read back off the playlist service so a failed playlist fetch doesn't
   * re-trigger itself on every poll.
   */
  private _contextUri: string | null = null;

  constructor(spotifyService: SpotifyService) {
    super();

    this.spotify = spotifyService;
  }

  init() {
    this.updatePlaybackStateAsync();

    this._isReady = true;
  }

  public get isReady(): boolean {
    return this._isReady;
  }

  public async updatePlaybackStateAsync(): Promise<void> {
    const startTime = now();

    try {
      if (!this.spotify.auth.isLinked) {
        this.clearState();
        await delay(15000, startTime);
        return this.updatePlaybackStateAsync();
      }

      const state =
        (await this.spotify.api.fetch<SpotifyPlayer>("/me/player")).data ??
        null;

      if (!state) {
        this.clearState();
        await delay(5000, startTime);
        return this.updatePlaybackStateAsync();
      }

      if (this.spotify.player.isPlaying !== state.is_playing) {
        this.emit("is-playing-state-changed", state.is_playing);
      }

      const contextUri =
        state.context?.type === "playlist" ? state.context.uri : null;

      // Edge triggered, otherwise a playlist we can't fetch is retried every poll
      if (contextUri !== this._contextUri) {
        this._contextUri = contextUri;
        this.emit("playlist-state-changed", contextUri);
      }

      // If target volume, user has manually changed volume and we don't want it falling back
      if (
        this.spotify.player.volume != state.device.volume_percent &&
        !this.spotify.player.volumeWasManuallyChanged
      ) {
        this.emit("volume-state-changed", state.device.volume_percent);
      }

      this._progressMs = state.progress_ms;

      const nextTrack = state.item;

      // If track has changed, fire event
      if (this.spotify.player.track.uri != nextTrack?.uri) {
        this.emit("track-changed", nextTrack);
      }
      return this.tick(state.is_playing ? 1000 : 5000, startTime);
    } catch (error) {
      // Already reported once per window by the api service, just stand down
      if (error instanceof RateLimitedError) {
        return this.tick(Math.max(error.retryAfterMs, 1000), startTime);
      }

      logger.error("Error checking track change on Spotify", error);
      return this.tick(15000, startTime);
    }
  }

  private clearState(): void {
    this._contextUri = null;
    this.emit("state-cleared", undefined);
  }

  private async tick(delayMs: number, startTime: number): Promise<void> {
    const diffedMs = now() - startTime + this._progressMs;
    this.spotify.events.trigger("tick", { progressMs: diffedMs });
    this.emit("tick", this._progressMs);
    await delay(delayMs, startTime);
    return this.updatePlaybackStateAsync();
  }
}
