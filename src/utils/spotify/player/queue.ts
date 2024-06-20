import { logger } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify";
import { SpotifyTrackSummary, trackSummaryFromDetails } from "./track";
import { getErrorMessage } from "@/utils/string";

export class SpotifyQueueService {
  private readonly spotify: SpotifyService;
  private tickCounter: number = 0;

  private _queue?: SpotifyQueueResponse;
  private _currentlyPlaying?: SpotifyTrackSummary | null;
  private _queueSummary?: SpotifyTrackSummary[];

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async init() {
    await this.updateQueueFromApi();

    this.spotify.player.state.on("tick", async () => {
      await this.handleNextTick();
    });

    this.spotify.player.state.on("track-changed", async () => {
      await this.updateQueueFromApi();
      this.tickCounter = 0;
    });
  }

  public get currentlyPlaying(): SpotifyTrackSummary | null {
    return this._currentlyPlaying ?? null;
  }

  public get raw(): SpotifyQueueResponse | null {
    return this._queue ?? null;
  }

  public get summary(): SpotifyTrackSummary[] {
    return this._queueSummary ?? [];
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
      if (!allowDuplicates && (await this.findIndexAsync(songUri)) !== -1) {
        throw new Error("Song already exists in queue");
      }

      await this.spotify.api.fetch(`/me/player/queue?uri=${songUri}`, "POST", {
        body: {
          device_id: this.spotify.device.id,
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

  private async handleNextTick() {
    try {
      if (this.tickCounter++ % 15 !== 0) return;

      const queueResponse = await this.getAsync();

      this.updateQueueAsync(queueResponse);
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  private async updateQueueFromApi() {
    try {
      const queue = await this.getAsync();

      this.updateQueueAsync(queue);
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  private updateQueueAsync(queueResponse?: SpotifyQueueResponse) {
    try {
      if (!this.queuesAreEqual(this._queue, queueResponse)) {
        this._queue = queueResponse;

        if (!queueResponse) return;

        const { queue, currently_playing } = queueResponse;

        this._currentlyPlaying = trackSummaryFromDetails(currently_playing);
        this._queueSummary = queue
          .map((q) => trackSummaryFromDetails(q))
          .filter((n) => n) as SpotifyTrackSummary[];

        this.spotify.events.trigger("queue-changed", {
          queue: this._queueSummary,
        });
      }
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      throw error;
    }
  }

  private queuesAreEqual(
    queue1?: SpotifyQueueResponse,
    queue2?: SpotifyQueueResponse
  ) {
    if (!queue1 || !queue2) {
      return queue1 === queue2;
    } else if (
      queue1.currently_playing.uri !== queue2.currently_playing.uri ||
      queue1.queue.length !== queue2.queue.length
    ) {
      return false;
    }

    for (let i = 0; i < queue1?.queue.length; i++) {
      if (queue1.queue[i].uri !== queue2.queue[i].uri) {
        return false;
      }
    }
  }
}
