import { logger } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify/index";

export default class SpotifyQueueService {
  private readonly spotify: SpotifyService;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async getAsync(): Promise<SpotifyQueueResponse> {
    try {
      const response = await this.spotify.api.fetch<SpotifyQueueResponse>(
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

  public async pushAsync(songUri: string, allowDuplicates: boolean = false) {
    try {
      const deviceId = (await this.spotify.player.getPlaybackStateAsync())
        .device.id;

      if (!allowDuplicates && (await this.findIndexAsync(songUri)) !== -1) {
        throw new Error("Song already exists in queue");
      }

      await this.spotify.api.fetch(`/me/player/queue?uri=${songUri}`, "POST", {
        body: {
          device_id: deviceId,
        },
      });
    } catch (error) {
      logger.error("Error pushing song to Spotify Queue", error);
      throw error;
    }
  }

  public async findIndexAsync(songUri: string) {
    const response = await this.getAsync();

    return [response.currently_playing, ...response.queue].findIndex(
      (a) => a.uri === songUri
    );
  }
}
