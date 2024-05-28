import { getCurrentAccessTokenAsync } from "@/spotifyIntegration";
import { logger, chatFeedAlert } from "@utils/firebot";
import ResponseError from "@/models/responseError";
import { SpotifyPlaybackState } from "@effects/spotifyChangePlaybackStateEffect";

const spotifyApiBaseUrl = "https://api.spotify.com/v1";

export default class Spotify {
  /**
   * Asynchronously finds a track based on the provided query and enqueues it on Spotify.
   *
   * @param {string} query - The search query for the track.
   * @return {Promise<FindAndEnqueueTrackResponse>} A promise that resolves to a FindAndEnqueueTrackResponse object.
   * The object contains a success flag indicating if the track was found and enqueued successfully,
   * and the track details if it was found, or an error message if it was not.
   */
  public static async findAndEnqueueTrackAsync(
    query: string,
    allowDuplicates = false
  ): Promise<FindAndEnqueueTrackResponse> {
    try {
      const accessToken = await getCurrentAccessTokenAsync();
      const track = await this.findTrackAsync(accessToken, query);

      if (!allowDuplicates) {
        const trackQueuePosition = await this.getTrackPositionInQueueAsync(
          track?.uri as string
        );

        if (trackQueuePosition !== -1) {
          return {
            success: false,
            data:
              trackQueuePosition === 0
                ? "the track is currently playing"
                : `the track already exists in queue, position ${trackQueuePosition}`,
          };
        }
      }

      await this.enqueueTrackAsync(track?.uri as string);

      track["queue_position"] = await this.getTrackPositionInQueueAsync(
        track?.uri as string
      );

      return {
        success: true,
        data: track,
      };
    } catch (error) {
      let message = error instanceof Error ? error.message : (error as string);

      chatFeedAlert(`Error finding and enqueuing track on Spotify: ${message}`);
      logger.error("Error finding and enqueuing track on Spotify", error);

      return {
        success: false,
        data: message,
      };
    }
  }

  public static async changePlyabckStateAsync(
    playbackStateOption: SpotifyPlaybackState
  ) {
    try {
      const accessToken = await getCurrentAccessTokenAsync();
      const playbackState = await this.getPlaybackStateAsync();
      const { is_playing: isPlaying } = playbackState;

      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      let endpoint: string;

      logger.info(`Setting playback state to ${playbackStateOption}`);

      switch (playbackStateOption) {
        case SpotifyPlaybackState.Play:
          logger.info("Play");
          if (isPlaying) throw new Error("Spotify is already playing");
          endpoint = getSpotifyApiUri("/me/player/play");
          break;
        case SpotifyPlaybackState.Pause:
          logger.info("Pause");
          if (!isPlaying) throw new Error("Spotify is already paused");
          endpoint = getSpotifyApiUri("/me/player/pause");
          break;
        case SpotifyPlaybackState.Toggle:
          logger.info("Toggle");
          endpoint = isPlaying
            ? getSpotifyApiUri("/me/player/pause")
            : getSpotifyApiUri("/me/player/play");
          break;
        default:
          throw new Error("Invalid Playback State");
      }

      await fetch(endpoint, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          device_id: playbackState.device.id,
        }),
      });

      return true;
    } catch (error) {
      logger.error("Error changing playback state on Spotify", error);
      return false;
    }
  }

  // #region Internal Helper functions

  // Getters

  private static async getPlaybackStateAsync(): Promise<SpotifyPlayer> {
    try {
      const accessToken = await getCurrentAccessTokenAsync();
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new ResponseError(
          "Could not get Spotify Playback State",
          response
        );
      }

      const data: SpotifyPlayer = await response.json();
      return data;
    } catch (error) {
      logger.error("Error getting playback state on Spotify", error);
      throw error;
    }
  }

  private static async getActiveDeviceIdAsync(): Promise<string> {
    try {
      const playbackState = await this.getPlaybackStateAsync();

      if (!playbackState.device) {
        throw new Error("Could not find Active Spotify Device");
      }

      return playbackState.device.id;
    } catch (error) {
      logger.error("Error getting active device", error);
      throw error;
    }
  }

  public static async getQueueAsync(): Promise<SpotifyQueueResponse> {
    try {
      const accessToken = await getCurrentAccessTokenAsync();

      const response = (await (
        await fetch(`https://api.spotify.com/v1/me/player/queue`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      ).json()) as SpotifyQueueResponse;

      logger.info(`Queue length: ${response?.queue.length}`);

      return await response;
    } catch (error) {
      logger.error("Error getting Spotify Queue", error);
      throw error;
    }
  }

  public static async getTrackPositionInQueueAsync(songUri: string) {
    const response = await this.getQueueAsync();

    return [response.currently_playing, ...response.queue].findIndex(
      (a) => a.uri === songUri
    );
  }

  public static async findTrackAsync(
    accessToken: string,
    search: string
  ): Promise<SpotifyTrackDetails> {
    try {
      const params = new URLSearchParams({
        q: search,
        type: "track",
        limit: "10",
      }).toString();

      const response = await fetch(
        `https://api.spotify.com/v1/search?${params}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new ResponseError(
          `Spotify API /v1/search/ returned status ${response.status}`,
          response
        );
      }

      const data = await response.json();

      return data.tracks.items[0];
    } catch (error) {
      logger.error("Error getting active device", error);
      throw error;
    }
  }

  private static async enqueueTrackAsync(trackUri: string) {
    try {
      const accessToken = await getCurrentAccessTokenAsync();
      const deviceId = await this.getActiveDeviceIdAsync();

      const response = await fetch(
        `https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            device_id: deviceId,
            uri: trackUri,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Response status not ok: ${JSON.stringify(response)}`);
      }

      return true;
    } catch (error) {
      logger.error("Error enqueuing track on Spotify", error);
      return false;
    }
  }

  // #endregion
}

// #region External Helper Functions
const getSpotifyApiUri = (path: string) => `${spotifyApiBaseUrl}${path}`;
// #endregion
