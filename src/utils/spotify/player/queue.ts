import { logger } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify/index";

export default class SpotifyQueueService {
  private readonly spotify: SpotifyService;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async getQueueAsync(): Promise<SpotifyQueueResponse> {
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

  public async findIndexAsync(songUri: string) {
    const response = await this.getQueueAsync();

    return [response.currently_playing, ...response.queue].findIndex(
      (a) => a.uri === songUri
    );
  }
}
