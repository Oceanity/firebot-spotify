import { getCurrentAccessTokenAsync } from "@/spotifyIntegration";
import { logger } from "@utils/logger";
import Store from "./store";
import ResponseError from "@/models/responseError";

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
    query: string
  ): Promise<FindAndEnqueueTrackResponse> {
    try {
      const accessToken = await getCurrentAccessTokenAsync();
      const track = await this.findTrackAsync(accessToken, query);

      await this.enqueueTrackAsync(accessToken, track?.uri as string);

      return {
        success: true,
        data: track,
      };
    } catch (error) {
      logger.error("Error finding and enqueuing track on Spotify", error);

      Store.Modules.effectRunner.processEffects({
        trigger: {
          type: "custom_script",
          metadata: {
            username: "script",
          },
        },
        effects: {
          id: Date.now(),
          list: [
            {
              id: "e6bac140-1894-11ef-a992-091f0a9405f6",
              type: "firebot:chat-feed-alert",
              active: true,
              message: `Error finding and enqueuing track on Spotify: ${
                error instanceof Error ? error.message : error
              }`,
            },
          ],
        },
      });
      return {
        success: false,
        data: error instanceof Error ? error.message : (error as string),
      };
    }
  }

  // Helper functions
  private static async getActiveDeviceIdAsync(
    accessToken: string
  ): Promise<string> {
    try {
      const response: SpotifyGetDevicesResponse = await (
        await fetch("https://api.spotify.com/v1/me/player/devices", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      ).json();

      const device = response.devices.find((d) => d.is_active);

      if (!device) {
        throw new Error("Could not find Active Spotify Device");
      }

      return device.id;
    } catch (error) {
      logger.error("Error getting active device", error);
      throw error;
    }
  }

  public static async getQueueAsync(): Promise<SpotifyQueueResponse | null> {
    const accessToken = await getCurrentAccessTokenAsync();

    const response = (await (
      await fetch(`https://api.spotify.com/v1/me/player/queue`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    ).json()) as SpotifyQueueResponse;

    return await response;
  }

  public static async isTrackQueuedAsync(songUri: string) {
    const response = await this.getQueueAsync();

    return (
      response?.currently_playing.uri === songUri ||
      response?.queue.some((a) => a.uri === songUri)
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
          method: "GET",
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

  private static async enqueueTrackAsync(
    accessToken: string,
    trackUri: string
  ) {
    try {
      const deviceId = await this.getActiveDeviceIdAsync(accessToken);

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
}
