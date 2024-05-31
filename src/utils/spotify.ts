import { getCurrentAccessTokenAsync } from "@/spotifyIntegration";
import { logger, chatFeedAlert } from "@utils/firebot";
import ResponseError from "@/models/responseError";

const spotifyApiBaseUrl = "https://api.spotify.com/v1";

export class SpotifyApi {
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
