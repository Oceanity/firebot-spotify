import { logger } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify";
import SpotifyQueueService from "./queue";

export default class SpotifyPlayerService {
  private readonly spotify: SpotifyService;
  public readonly queue: SpotifyQueueService;

  private activeDeviceId: string | null = null;
  private lastDevicePollTime: number | null = null;
  private readonly minutesToCacheDeviceId: number = 15;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;

    this.queue = new SpotifyQueueService(this.spotify);
  }

  /**
   * Gets the current playback state of the user's Spotify player if an active device is found.
   *
   * @return {Promise<SpotifyPlayer | null>} A promise that resolves to a SpotifyPlayer object
   * representing the current playback state, or null if no active player is found.
   * @throws {Error} If an error occurs while fetching the player state.
   */
  public async getPlaybackStateAsync(): Promise<SpotifyPlayer> {
    try {
      const response = await this.spotify.api.fetch<SpotifyPlayer>(
        "/me/player"
      );

      if (!response.data) {
        throw new Error("No active Spotify player was found");
      }

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

      const deviceId = await this.getActiveDeviceIdAsync();

      this.activeDeviceId = deviceId;
      this.lastDevicePollTime = Date.now();

      return deviceId;
    } catch (error) {
      logger.error("Error getting active device ID on Spotify", error);
      throw error;
    }
  }

  /**
   * Gets the current playback state of the user's Spotify player if an active device is found.
   *
   * @return {Promise<SpotifyCurrentlyPlaying>} A promise that resolves to a SpotifyCurrentlyPlaying object
   * representing the current playback state, or null if no active player is found.
   * @throws {Error} If an error occurs while fetching the currently playing state.
   */
  public async getCurrentlyPlaying(): Promise<SpotifyCurrentlyPlaying> {
    try {
      const response = await this.spotify.api.fetch<SpotifyCurrentlyPlaying>(
        "/me/player/currently-playing"
      );

      if (!response.data) {
        throw new Error("No active Spotify player was found");
      }

      return response.data;
    } catch (error) {
      logger.error("Error getting currently playing on Spotify", error);
      throw error;
    }
  }

  /**
   * Resumes the current playback of the user's Spotify player if it is currently paused.
   *
   * @return {Promise<void>} A promise that resolves when the Spotify playback is successfully resumed.
   * @throws {Error} If the Spotify player is already playing.
   */
  public async playAsync(): Promise<void> {
    try {
      const isPlaying = (await this.getPlaybackStateAsync()).is_playing;

      if (isPlaying) throw new Error("Spotify is already playing");

      await this.spotify.api.fetch("/me/player/play", "PUT");
    } catch (error) {
      logger.error("Error resuming Spotify playback", error);
    }
  }

  /**
   * Pauses the current playback of the user's Spotify player if it is currently playing.
   *
   * @return {Promise<boolean>} A promise that resolves when the Spotify playback is successfully paused.
   * @throws {Error} If the Spotify player is not currently playing.
   */
  public async pauseAsync(): Promise<void> {
    try {
      const isPlaying = (await this.getPlaybackStateAsync()).is_playing;

      if (!isPlaying) throw new Error("Spotify is not playing");

      await this.spotify.api.fetch("/me/player/pause", "PUT");
    } catch (error) {
      logger.error("Error pausing Spotify playback", error);
    }
  }

  /**
   * Toggles the playback of the user's Spotify player between playing and paused states.
   *
   * @return {Promise<void>} A promise that resolves when the Spotify playback is successfully toggled.
   * @throws {Error} If there is an error while toggling the playback state.
   */
  public async playPauseAsync(): Promise<void> {
    const isPlaying = (await this.getPlaybackStateAsync()).is_playing;

    return isPlaying ? await this.pauseAsync() : await this.playAsync();
  }

  /**
   * Skips to the next track in the user's Spotify player.
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
   * Sets the volume of the user's Spotify player.
   *
   * @param {number} volume - The volume to set. Must be a number between 0 and 100.
   * @return {Promise<void>} A promise that resolves when the volume is successfully set.
   * @throws {Error} If the volume is not a number between 0 and 100.
   */
  public async setVolumeAsync(volume: number): Promise<void> {
    try {
      if (volume < 0 || volume > 100 || volume % 1 !== 0)
        throw new Error("Spotify volume must be an integer between 0 and 100");

      await this.spotify.api.fetch(
        `/me/player/volume?volume_percent=${volume}`,
        "PUT"
      );
    } catch (error) {
      logger.error("Error setting Spotify volume", error);
    }
  }

  /**
   * Sets the repeat state of the user's Spotify player.
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

  private useCachedDeviceId = () =>
    this.activeDeviceId &&
    this.lastDevicePollTime &&
    Date.now() - this.lastDevicePollTime <
      this.minutesToCacheDeviceId * 60 * 1000;
}
