import { integration, spotifyIsConnected } from "@/spotifyIntegration";
import { logger } from "@utils/logger";
import Store from "./store";

export default class Spotify {
  // Public static methods
  public static async findAndEnqueueTrackAsync(
    accessToken: string,
    query: string
  ): Promise<FindAndEnqueueTrackResponse> {
    try {
      accessToken = await this.ensureAccessTokenIsValidAsync(accessToken);
      const deviceId = await this.getActiveDeviceIdAsync(accessToken);
      const track = await this.findTrackAsync(accessToken, query);

      await this.enqueueTrackAsync(accessToken, deviceId, track?.uri as string);

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
              message: error as string,
            },
          ],
        },
      });
      return {
        success: false,
        data: error as string,
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

  public static async getQueueAsync(
    accessToken: string
  ): Promise<SpotifyQueueResponse | null> {
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

  public static async isTrackQueuedAsync(accessToken: string, songUri: string) {
    const response = await this.getQueueAsync(accessToken);

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

      const response = await (
        await fetch(`https://api.spotify.com/v1/search?${params}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })
      ).json();

      return response.tracks.items[0];
    } catch (error) {
      logger.error("Error getting active device", error);
      throw error;
    }
  }

  private static async enqueueTrackAsync(
    accessToken: string,
    deviceId: string,
    trackUri: string
  ) {
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
    return response.status === 204;
  }

  private static async ensureAccessTokenIsValidAsync(accessToken: string) {
    if (!(await spotifyIsConnected(accessToken))) {
      accessToken = (await integration.refreshToken()) ?? "";
      if (!accessToken.length)
        throw new Error("Could not refresh Spotify Access Token");
    }
    return accessToken;
  }
}
