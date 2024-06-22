import { logger } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify";
import { SpotifyQueueService } from "./queue";
import { SpotifyPlaylistService } from "./playlist";
import { SpotifyLyricsService } from "./lyrics";
import { SpotifyStateService } from "./state";
import { SpotifyTrackService } from "./track";
import { EventEmitter } from "events";
import ResponseError from "@/models/responseError";
import { randomUUID } from "crypto";

export default class SpotifyPlayerService extends EventEmitter {
  private readonly spotify: SpotifyService;
  public readonly queue: SpotifyQueueService;
  public readonly playlist: SpotifyPlaylistService;
  public readonly lyrics: SpotifyLyricsService;
  public readonly state: SpotifyStateService;
  public readonly track: SpotifyTrackService;

  // Obscured vars
  private _isPlaying: boolean = false;
  private _targetIsPlaying: boolean | null = null;
  private _volume: number = -1;
  private _targetVolume: number = -1;
  private _lastCallId?: string | null;
  private _playbackChangePending: boolean = false;

  constructor(spotifyService: SpotifyService) {
    super();

    this.spotify = spotifyService;

    this.queue = new SpotifyQueueService(this.spotify);
    this.playlist = new SpotifyPlaylistService(this.spotify);
    this.lyrics = new SpotifyLyricsService(this.spotify);
    this.state = new SpotifyStateService(this.spotify);
    this.track = new SpotifyTrackService(this.spotify);
  }

  public async init() {
    await this.lyrics.init();
    await this.state.init();
    await this.track.init();
    await this.playlist.init();
    await this.queue.init();

    this.state.on("is-playing-state-changed", (isPlaying) => {
      this.updateIsPlaying(isPlaying);
    });
    this.state.on("volume-state-changed", (volumePercent) => {
      if (!this._playbackChangePending) {
        this.updateVolume(volumePercent);
      }
    });
  }

  //#region Getters

  /**
   * Gets the current playback state of the user's Spotify player.
   *
   * @returns {boolean} `true` if Spotify is currently playing, `false` if not.
   */
  public get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Gets the volume of the user's Spotify player.
   *
   * @return {number} The volume of the player, between 0 and 100.
   */
  public get volume(): number {
    return this._volume;
  }

  public get volumeWasManuallyChanged(): boolean {
    return this._targetVolume !== -1;
  }

  private get callId() {
    this._lastCallId = randomUUID();
    return this._lastCallId;
  }

  private updateIsPlaying = (isPlaying: boolean) => {
    this._isPlaying = isPlaying;
    if (this._targetIsPlaying === isPlaying) {
      this._targetIsPlaying = null;
      return;
    }

    this.spotify.events.trigger("playback-state-changed", { isPlaying });
  };

  private updateVolume = (volume: number) => {
    // If first value set or target volume not met, do not emit
    if (this._volume === -1 || this._targetVolume === volume) {
      this._targetVolume = -1;
      this._volume = volume;
      return;
    }

    this._volume = volume;
    this.spotify.events.trigger("volume-changed", { volume });
  };
  //#endregion

  /**
   * Gets the current playback state of the user's Spotify player if an active device is found.
   *
   * @return {Promise<SpotifyPlayer | null>} A promise that resolves to a SpotifyPlayer object
   * representing the current playback state, or null if no active player is found.
   * @throws {Error} If an error occurs while fetching the player state.
   */
  public async getPlaybackStateAsync(): Promise<SpotifyPlayer | null> {
    try {
      const response = await this.spotify.api.fetch<SpotifyPlayer>(
        "/me/player"
      );

      return response.data;
    } catch (error) {
      logger.error("Error getting playback state on Spotify", error);
      throw error;
    }
  }

  /**
   * Resumes the current playback of the user's Spotify player if it is currently paused.
   * *Requires Spotify Premium
   *
   * @return {Promise<void>} A promise that resolves when the Spotify playback is successfully resumed.
   * @throws {Error} If the Spotify player is already playing.
   */
  public async playAsync(): Promise<void> {
    const callId = this.callId;

    try {
      if (this.isPlaying) return;
      this._playbackChangePending = true;

      const response = await this.spotify.api.fetch("/me/player/play", "PUT", {
        device_id: this.spotify.device.id,
      });

      if (!response.ok) {
        throw new ResponseError("Error playing Spotify playback", response);
      }

      this._isPlaying = true;

      this.spotify.events.trigger("playback-state-changed", {
        isPlaying: true,
      });

      if (callId === this._lastCallId) {
        this._playbackChangePending = false;
      }
    } catch (error) {
      logger.error("Error resuming Spotify playback", error);
    }
  }

  /**
   * Pauses the current playback of the user's Spotify player if it is currently playing.
   * *Requires Spotify Premium
   *
   * @return {Promise<boolean>} A promise that resolves when the Spotify playback is successfully paused.
   * @throws {Error} If the Spotify player is not currently playing.
   */
  public async pauseAsync(): Promise<void> {
    const callId = this.callId;

    try {
      if (!this.isPlaying) return;
      this._playbackChangePending = true;

      const response = await this.spotify.api.fetch("/me/player/pause", "PUT", {
        device_id: this.spotify.device.id,
      });

      if (!response.ok) {
        throw new ResponseError("Error pausing Spotify playback", response);
      }

      this._isPlaying = false;

      this.spotify.events.trigger("playback-state-changed", {
        isPlaying: false,
      });

      if (callId === this._lastCallId) {
        this._playbackChangePending = false;
      }
    } catch (error) {
      logger.error("Error pausing Spotify playback", error);
    }
  }

  /**
   * Toggles the playback of the user's Spotify player between playing and paused states.
   * *Requires Spotify Premium
   *
   * @return {Promise<void>} A promise that resolves when the Spotify playback is successfully toggled.
   * @throws {Error} If there is an error while toggling the playback state.
   */
  public async playPauseAsync(): Promise<void> {
    return this.isPlaying ? await this.pauseAsync() : await this.playAsync();
  }

  /**
   * Skips to the next track in the user's Spotify player.
   * *Requires Spotify Premium
   *
   * @return {Promise<void>} A promise that resolves when the next track is successfully skipped.
   * @throws {Error} If the Spotify user is not premium or if there is an error skipping to the next track.
   */
  public async nextAsync() {
    try {
      await this.spotify.api.fetch("/me/player/next", "POST");
    } catch (error) {
      logger.error("Error skipping to next track on Spotify", error);
      throw error;
    }
  }

  /**
   * Skips to the previous track in the user's Spotify player.
   * *Requires Spotify Premium
   *
   * @return {Promise<void>} A promise that resolves when the previous track is successfully skipped.
   * @throws {Error} If the Spotify user is not premium or if there is an error skipping to the previous track.
   */
  public async previousAsync() {
    try {
      await this.spotify.api.fetch("/me/player/previous", "POST");
    } catch (error) {
      logger.error("Error skipping to previous track on Spotify", error);
      throw error;
    }
  }

  /**
   * Seeks to a specific position in the user's Spotify player.
   * *Requires Spotify Premium
   *
   * @param {number} positionMS - The position in milliseconds to seek to. Must be greater than 0.
   * @return {Promise<void>} A promise that resolves when the seek is successfully completed.
   * @throws {Error} If the position is not greater than 0 or if the Spotify user is not premium.
   */
  public async seekToPositionAsync(positionMS: number) {
    try {
      if (positionMS < 0) positionMS = 0;

      await this.spotify.api.fetch(
        `/me/player/seek?position_ms=${positionMS}`,
        "PUT",
        {
          body: {
            device_id: this.spotify.device.id,
          },
        }
      );
    } catch (error) {
      logger.error("Error seeking to position on Spotify", error);
      throw error;
    }
  }

  /**
   * Sets the volume of the user's Spotify player.
   * *Requires Spotify Premium
   *
   * @param {number} volume - The volume to set. Must be a number between 0 and 100.
   * @return {Promise<void>} A promise that resolves when the volume is successfully set.
   * @throws {Error} If the volume is not a number between 0 and 100.
   */
  public async setVolumeAsync(volume: number): Promise<void> {
    try {
      if (volume < 0 || volume > 100 || volume % 1 !== 0) {
        throw new Error("Spotify volume must be an integer between 0 and 100");
      }

      const response = await this.spotify.api.fetch(
        `/me/player/volume?volume_percent=${volume}`,
        "PUT"
      );

      if (response.ok) {
        this._volume = volume;
        this._targetVolume = volume;

        this.spotify.events.trigger("volume-changed", { volume });
      }
    } catch (error) {
      logger.error("Error setting Spotify volume", error);
    }
  }

  /**
   * Sets the repeat state of the user's Spotify player.
   * *Requires Spotify Premium
   *
   * @param {SpotifyRepeatState} repeatState - The repeat state to set.
   * @return {Promise<void>} A promise that resolves when the repeat state is successfully set.
   * @throws {Error} If the Spotify user is not premium or if there is an error setting the repeat state.
   */
  public async setRepeatStateAsync(
    repeatState: SpotifyRepeatState
  ): Promise<void> {
    try {
      await this.spotify.api.fetch(
        `/me/player/repeat?state=${repeatState}`,
        "PUT"
      );
    } catch (error) {
      logger.error("Error toggling Spotify playback", error);
    }
  }
}
