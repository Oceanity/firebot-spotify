import { getCurrentAccessTokenAsync } from "@/spotifyIntegration";
import { logger, chatFeedAlert } from "@utils/firebot";
import ResponseError from "@/models/responseError";
import { SpotifyPlaybackState } from "@effects/spotifyChangePlaybackStateEffect";
import { SpotifySkipTarget } from "@/firebot/effects/spotifySkipTrackEffect";

const spotifyApiBaseUrl = "https://api.spotify.com/v1";

export default class SpotifyApi {
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
      const track = await findTrackAsync(query);

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

      await enqueueTrackAsync(track?.uri as string);

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

  public static async changePlaybackStateAsync(
    playbackStateOption: SpotifyPlaybackState
  ) {
    try {
      if (await !isUserPremiumAsync()) {
        throw new Error(
          "This method uses the /me/player/play and /me/player/pause endpoints, which requires a premium account."
        );
      }

      const playbackState = await getPlaybackStateAsync();

      if (!playbackState) {
        throw new Error("No active Spotify player was found");
      }

      const { is_playing: isPlaying } = playbackState;

      switch (playbackStateOption) {
        case SpotifyPlaybackState.Play:
          await resumePlaybackAsync(isPlaying);
          break;
        case SpotifyPlaybackState.Pause:
          await pausePlaybackAsync(isPlaying);
          break;
        case SpotifyPlaybackState.Toggle:
          await togglePlaybackAsync(isPlaying);
          break;
        default:
          throw new Error("Invalid Playback State");
      }

      return true;
    } catch (error) {
      let message = error instanceof Error ? error.message : (error as string);

      chatFeedAlert(`Error changing playback state on Spotify: ${message}`);
      logger.error("Error changing playback state on Spotify", error);

      return false;
    }
  }

  public static async changePlaybackVolumeAsync(volume: number) {
    try {
      if (await !isUserPremiumAsync()) {
        throw new Error(
          "This method uses the /me/player/volume endpoint, which requires a premium account."
        );
      }

      await setPlaybackVolumeAsync(volume);

      return true;
    } catch (error) {
      let message = error instanceof Error ? error.message : (error as string);

      chatFeedAlert(`Error changing playback volume on Spotify: ${message}`);
      logger.error("Error changing playback volume on Spotify", error);

      return false;
    }
  }

  public static async skipTrackAsync(target: SpotifySkipTarget) {
    try {
      if (await !isUserPremiumAsync()) {
        throw new Error(
          "This method uses the /me/player/next and /me/player/previous endpoints, which requires a premium account."
        );
      }

      switch (target) {
        case SpotifySkipTarget.Next:
          await skipToNextTrackAsync();
          break;
        case SpotifySkipTarget.Previous:
          await skipToPreviousTrackAsync();
          break;
        default:
          throw new Error("Invalid Skip Target");
      }

      return true;
    } catch (error) {
      let message = error instanceof Error ? error.message : (error as string);

      chatFeedAlert(`Error skipping to next track on Spotify: ${message}`);
      logger.error("Error skipping to next track on Spotify", error);

      return false;
    }
  }

  // getTrackPositionInQueueAsync
  public static async getTrackPositionInQueueAsync(songUri: string) {
    const response = await getQueueAsync();

    return [response.currently_playing, ...response.queue].findIndex(
      (a) => a.uri === songUri
    );
  }
}

// #region External Helper Functions
const getSpotifyApiUri = (path: string) => `${spotifyApiBaseUrl}${path}`;

async function makeSpotifyApiRequestAsync<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" = "GET",
  options?: any
) {
  try {
    const accessToken = await getCurrentAccessTokenAsync();

    const response = await fetch(getSpotifyApiUri(endpoint), {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      ...options,
    });

    if (!response.ok) {
      throw new ResponseError(
        `Spotify API /v1/${endpoint} returned status ${response.status}`,
        response
      );
    }

    // If no data response, return to avoid throwing an error
    if (response.status === 204) {
      return {
        status: response.status,
        data: null,
      };
    }

    const data: T = await response.json();

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    logger.error("Error making Spotify API request", error);
    throw error;
  }
}

// #region Spotify /me methods
async function getUserProfileAsync(): Promise<SpotifyUserProfile> {
  try {
    const response = await makeSpotifyApiRequestAsync<SpotifyUserProfile>(
      "/me"
    );
    if (!response.data) {
      throw new Error("Could not retrieve Spotify user profile");
    }
    return response.data;
  } catch (error) {
    logger.error("Error getting user profile on Spotify", error);
    throw error;
  }
}

async function isUserPremiumAsync(): Promise<boolean> {
  try {
    const profile = await getUserProfileAsync();
    return profile.product === "premium";
  } catch (error) {
    logger.error("Error getting premium status on Spotify", error);
    throw error;
  }
}

async function getPlaybackStateAsync(): Promise<SpotifyPlayer | null> {
  try {
    const response = await makeSpotifyApiRequestAsync<SpotifyPlayer>(
      "/me/player"
    );
    return response.data;
  } catch (error) {
    logger.error("Error getting playback state on Spotify", error);
    throw error;
  }
}

async function pausePlaybackAsync(isPlaying: boolean): Promise<void> {
  try {
    if (!isPlaying) {
      throw new Error("Spotify is not playing");
    }
    await makeSpotifyApiRequestAsync("/me/player/pause", "PUT");
  } catch (error) {
    logger.error("Error pausing Spotify playback", error);
    throw error;
  }
}

async function resumePlaybackAsync(isPlaying: boolean): Promise<void> {
  try {
    if (isPlaying) {
      throw new Error("Spotify is already playing");
    }
    await makeSpotifyApiRequestAsync("/me/player/play", "PUT");
  } catch (error) {
    logger.error("Error resuming Spotify playback", error);
    throw error;
  }
}

async function togglePlaybackAsync(isPlaying: boolean): Promise<void> {
  if (isPlaying) {
    await pausePlaybackAsync(isPlaying);
  } else {
    await resumePlaybackAsync(isPlaying);
  }
}

async function skipToNextTrackAsync(): Promise<void> {
  try {
    await makeSpotifyApiRequestAsync("/me/player/next", "POST");
  } catch (error) {
    logger.error("Error skipping to next track on Spotify", error);
    throw error;
  }
}

async function skipToPreviousTrackAsync(): Promise<void> {
  try {
    await makeSpotifyApiRequestAsync("/me/player/previous", "POST");
  } catch (error) {
    logger.error("Error skipping to previous track on Spotify", error);
    throw error;
  }
}

async function setPlaybackVolumeAsync(volume: number): Promise<void> {
  try {
    const deviceId = (await getPlaybackStateAsync())?.device.id;
    const clampedVolume = Math.floor(Math.max(0, Math.min(100, volume)));
    if (!deviceId) {
      throw new Error("Could not find Active Spotify Device");
    }
    await makeSpotifyApiRequestAsync(
      `/me/player/volume?volume_percent=${clampedVolume}`,
      "PUT",
      {
        body: {
          device_id: deviceId,
        },
      }
    );
  } catch (error) {
    logger.error("Error setting Spotify volume", error);
    throw error;
  }
}

async function getQueueAsync(): Promise<SpotifyQueueResponse> {
  try {
    const response = await makeSpotifyApiRequestAsync<SpotifyQueueResponse>(
      "/me/player/queue"
    );
    if (!response.data) {
      throw new Error("No active Spotify player was found");
    }
    return response.data;
  } catch (error) {
    logger.error("Error getting Spotify Queue", error);
    throw error;
  }
}

async function enqueueTrackAsync(trackUri: string) {
  try {
    const deviceId = (await getPlaybackStateAsync())?.device.id;

    if (!deviceId) {
      throw new Error("Could not find Active Spotify Device");
    }

    await makeSpotifyApiRequestAsync(
      `/me/player/queue?uri=${trackUri}`,
      "POST",
      {
        body: JSON.stringify({
          device_id: deviceId,
          uri: trackUri,
        }),
      }
    );
  } catch (error) {
    logger.error("Error enqueuing track on Spotify", error);
    throw error;
  }
}
// #endregion

// #region Spotify /search methods

async function findTrackAsync(search: string): Promise<SpotifyTrackDetails> {
  try {
    const params = new URLSearchParams({
      q: search,
      type: "track",
      limit: "10",
    }).toString();

    const response = await makeSpotifyApiRequestAsync<SpotifySearchResponse>(
      `/search?${params}`,
      "GET"
    );

    if (!response.data) {
      throw new Error("Could not retrieve Spotify track");
    }

    return response.data.tracks.items[0];
  } catch (error) {
    logger.error("Error getting active device", error);
    throw error;
  }
}
// #endregion

// #endregion
