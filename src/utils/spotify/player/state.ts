import { eventManager, logger } from "@utils/firebot";
import { delay } from "@utils/timing";
import { SpotifyService } from "@utils/spotify";
import { EventEmitter } from "events";

export class SpotifyPlayerStateService extends EventEmitter {
  private readonly spotify: SpotifyService;

  private _progressMs: number = 0;

  constructor(spotifyService: SpotifyService) {
    super();

    this.spotify = spotifyService;
  }

  init() {
    this.updatePlaybackStateAsync();
  }

  private async updatePlaybackStateAsync(): Promise<void> {
    const startTime = performance.now();

    try {
      if (!this.spotify.auth.isLinked) {
        this.emit("state-cleared", undefined);
        await delay(15000, startTime);
        return this.updatePlaybackStateAsync();
      }

      const state =
        (await this.spotify.api.fetch<SpotifyPlayer>("/me/player")).data ??
        null;

      if (!state) {
        this.emit("state-cleared", undefined);
        await delay(5000, startTime);
        return this.updatePlaybackStateAsync();
      }

      if (this.spotify.player.device.id !== state.device.id) {
        this.emit("device-id-state-changed", state.device.id);
      }

      if (this.spotify.player.isPlaying !== state.is_playing) {
        this.emit("is-playing-state-changed", state.is_playing);
      }

      if (state.context) {
        switch (state.context.type) {
          case "playlist":
            if (state.context.uri !== this.spotify.player.playlist.uri) {
              this.emit("playlist-state-changed", state.context.uri);
            }
            break;
        }
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
      if (this.spotify.player.trackService.uri != nextTrack?.uri) {
        this.emit("track-state-changed", nextTrack);
        this.spotify.events.trigger("track-changed", nextTrack ?? null);
      }
      return this.tick(state.is_playing ? 1000 : 5000, startTime);
    } catch (error) {
      logger.error("Error checking track change on Spotify", error);
      return this.tick(15000, startTime);
    }
  }

  private async tick(delayMs: number, startTime: number): Promise<void> {
    const diffedMs = performance.now() - startTime + this._progressMs;
    this.spotify.events.trigger("tick", { progressMs: diffedMs });
    this.emit("tick", this._progressMs);
    await delay(delayMs, startTime);
    return this.updatePlaybackStateAsync();
  }
}
