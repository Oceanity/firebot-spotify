import { eventManager, logger } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify";
import { delay } from "@/utils/timing";
import { msToFormattedString } from "@/utils/strings";
import SpotifyQueueService from "./queue";
import SpotifyPlaylistService from "./playlist";
import { SpotifyLyricsService } from "./lyrics";
import { getBiggestImageUrl } from "@/utils/array";
import { EventEmitter } from "events";

type SpotifyTrackSummary = {
  id: string;
  uri: string;
  title: string;
  artists: string[];
  album: string;
  albumArtUrl: string;
  url: string;
  durationMs: number;
  duration: string;
  positionMs: number;
  position: string;
  relativePosition: number;
  context: SpotifyContext | null;
};

export default class SpotifyPlayerService extends EventEmitter {
  private readonly spotify: SpotifyService;
  public readonly queue: SpotifyQueueService;
  public readonly playlist: SpotifyPlaylistService;
  public readonly lyrics: SpotifyLyricsService;

  private readonly minutesToCacheDeviceId: number = 15;
  private activeDeviceId: string | null = null;
  private lastDevicePollTime: number | null = null;

  // Obscured vars
  private _progressMs: number = 0;
  private _isPlaying: boolean = false;
  private _track: SpotifyTrackDetails | null = null;
  private _volume: number = 0;
  private _targetVolume: number = -1;
  private _context: SpotifyContext | null = null;

  constructor(spotifyService: SpotifyService) {
    super();

    this.spotify = spotifyService;

    this.queue = new SpotifyQueueService(this.spotify);
    this.playlist = new SpotifyPlaylistService(this.spotify);
    this.lyrics = new SpotifyLyricsService(this.spotify);
  }

  public init() {
    this.updatePlaybackState();
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

  /**
   * Gets the currently playing track summary, or null if no track is playing.
   *
   * @return {SpotifyTrackSummary | null} The currently playing track summary, or null if not playing.
   */
  public get track(): SpotifyTrackSummary | null {
    // Return null if no track is playing
    if (!this._track) return null;

    // Map artists to just their names
    const artists = this._track.artists.map((a) => a.name);

    // Get the URL of the biggest image for the album
    const albumArtUrl = getBiggestImageUrl(this._track.album.images);

    return {
      id: this._track.id,
      uri: this._track.uri,
      title: this._track.name,
      artists,
      album: this._track.album.name,
      albumArtUrl,
      url: this._track.external_urls.spotify,
      durationMs: this._track.duration_ms,
      duration: msToFormattedString(this._track.duration_ms, false),
      positionMs: this._progressMs,
      position: msToFormattedString(this._progressMs, false),
      relativePosition: this._progressMs / this._track.duration_ms,
      context: this._context ?? null,
    };
  }

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
   * Gets the active device ID of the user's Spotify player if an active device is found.
   *
   * @return {Promise<string>} A promise that resolves to a string representing the
   * active device ID, or null if no active player is found.
   * @throws {Error} If an error occurs while fetching the active device ID.
   */
  public async getActiveDeviceIdAsync(): Promise<string> {
    try {
      if (this.useCachedDeviceId()) return this.activeDeviceId!;

      const playbackState = await this.getPlaybackStateAsync();
      if (!playbackState) {
        throw new Error("No active Spotify player was found");
      }

      this.activeDeviceId = playbackState.device.id;
      this.lastDevicePollTime = Date.now();

      return this.activeDeviceId;
    } catch (error) {
      logger.error("Error getting active device ID on Spotify", error);
      throw error;
    }
  }

  /**
   * Gets the currently playing track.
   *
   * @return {SpotifyTrackDetails | null} The currently playing track, or null if no track is playing.
   */
  public readonly getCurrentlyPlaying = (): SpotifyTrackDetails | null =>
    this._track;

  /**
   * Resumes the current playback of the user's Spotify player if it is currently paused.
   * *Requires Spotify Premium
   *
   * @return {Promise<void>} A promise that resolves when the Spotify playback is successfully resumed.
   * @throws {Error} If the Spotify player is already playing.
   */
  public async playAsync(): Promise<void> {
    try {
      if (this.isPlaying) throw new Error("Spotify is already playing");

      await this.spotify.api.fetch("/me/player/play", "PUT");
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
    try {
      if (!this.isPlaying) throw new Error("Spotify is not playing");

      await this.spotify.api.fetch("/me/player/pause", "PUT");
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
      if (!(await this.spotify.me.isUserPremiumAsync()))
        throw new Error("Spotify Premium required to skip tracks");

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
      if (!(await this.spotify.me.isUserPremiumAsync()))
        throw new Error("Spotify Premium required to skip tracks");

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

      if (!(await this.spotify.me.isUserPremiumAsync()))
        throw new Error("Spotify Premium required to seek");

      await this.spotify.api.fetch(
        `/me/player/seek?position_ms=${positionMS}`,
        "PUT",
        {
          body: {
            device_id: this.activeDeviceId,
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
        eventManager.triggerEvent("oceanity-spotify", "volume-changed", {
          volume: this._volume,
        });
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
      if (!(await this.spotify.me.isUserPremiumAsync()))
        throw new Error("Spotify Premium required to set repeat state");

      await this.spotify.api.fetch(
        `/me/player/repeat?state=${repeatState}`,
        "PUT"
      );
    } catch (error) {
      logger.error("Error toggling Spotify playback", error);
    }
  }

  public async getCurrentPlaylistName(): Promise<string> {
    try {
      if (!this._context || this._context.type != "playlist") return "";

      const playlist = await this.spotify.api.fetch<SpotifyPlaylistDetails>(
        `/playlists/${this._context.uri.split(":")[2]}`
      );

      return playlist.data?.name ?? "";
    } catch (error) {
      logger.error("Error getting current playlist name", error);
      return "";
    }
  }

  //#region Continuous methods
  private async updatePlaybackState(): Promise<void> {
    const startTime = performance.now();

    try {
      if (!this.spotify.auth.isLinked) {
        this.clearNowPlaying();
        await delay(5000, startTime);
        return this.updatePlaybackState();
      }

      const state =
        (await this.spotify.api.fetch<SpotifyPlayer>("/me/player")).data ??
        null;

      if (!state) {
        this.clearNowPlaying();
        return this.tick(5000, startTime);
      }

      this.activeDeviceId = state.device.id;

      if (this._isPlaying != state.is_playing) {
        eventManager.triggerEvent(
          "oceanity-spotify",
          "playback-state-changed",
          this.track ?? {}
        );
        this._isPlaying = state.is_playing;
      }

      if (state.context && this.playlist.id !== state.context.uri) {
        await this.playlist.updateCurrentPlaylistAsync(state.context.uri);
      }

      // If target volume, user has manually changed volume and we don't want it falling back
      if (
        this._volume != state.device.volume_percent &&
        this._targetVolume === -1
      ) {
        eventManager.triggerEvent("oceanity-spotify", "volume-changed", {});
        this._volume = state.device.volume_percent;
      } else if (state.device.volume_percent === this._targetVolume) {
        this._targetVolume = -1;
      }

      this._progressMs = state.progress_ms;

      const nextTrack = state.item;

      // If track has changed, fire event
      if (this._track?.uri != nextTrack?.uri) {
        this._track = nextTrack;
        eventManager.triggerEvent(
          "oceanity-spotify",
          "track-changed",
          this.track ?? {}
        );

        this.emit("track-changed", this._track);
      }
      return this.tick(state.is_playing ? 1000 : 5000, startTime);
    } catch (error) {
      logger.error("Error checking track change on Spotify", error);
      this.clearNowPlaying();
      return this.tick(15000, startTime);
    }
  }
  //#endregion

  //#region Helper Methods
  private useCachedDeviceId = () =>
    this.activeDeviceId != null &&
    this.lastDevicePollTime != null &&
    Date.now() - this.lastDevicePollTime <
      this.minutesToCacheDeviceId * 60 * 1000;

  private clearNowPlaying(): void {
    this._isPlaying = false;
    this._track = null;
    this._progressMs = 0;
  }

  private async tick(delayMs: number, startTime: number): Promise<void> {
    eventManager.triggerEvent("oceanity-spotify", "tick", {});
    await delay(delayMs, startTime);
    return this.updatePlaybackState();
  }
  //#endregion
}
