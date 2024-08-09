import { logger } from "@oceanity/firebot-helpers/firebot";
import { SpotifyService } from "@utils/spotify";
import {
  cleanUsername,
} from "@oceanity/firebot-helpers/string";
import { now } from "@/utils/time";
import { trackSummaryFromDetails } from "./track";

export type SpotifyUserQueueEntry = {
  position?: number;
  queuedBy?: string;
  track: SpotifyTrackSummary;
  skip: boolean;
};

export class SpotifyQueueService {
  private readonly spotify: SpotifyService;

  private _currentlyPlaying?: SpotifyTrackSummary | null;
  private _userQueues: SpotifyUserQueueEntry[] = [];
  private _queuedBy: string | null;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;

    this._queuedBy = null;
  }

  public async init() {
    this.spotify.player.state.on("track-changed", async (track) => {
      const queuePosition = this._userQueues.findIndex(
        (queue) => queue.track.uri === track.uri
      );

      if (queuePosition === -1) {
        this._queuedBy = null;
        this.spotify.events.trigger("track-changed", {
          track,
        });
        return;
      }

      // Splice out the track to check if it should be skipped
      const [userQueue] = this._userQueues.splice(queuePosition, 1);

      if (userQueue.skip) {
        await this.spotify.player.nextAsync();
        this.spotify.events.trigger("track-auto-skipped", {
          track,
        });
        return;
      }

      this._queuedBy = cleanUsername(userQueue.queuedBy);
      this.spotify.events.trigger("track-changed", {
        track,
      });
    });
  }

  public get currentlyPlaying(): SpotifyTrackSummary | null {
    return this._currentlyPlaying ?? null;
  }

  public get userQueues(): SpotifyUserQueueEntry[] {
    return this._userQueues
      .filter((queue) => !queue.skip)
      .map((queue, index) => ({
        ...queue,
        position: index + 1,
      }));
  }

  public get trackWasUserQueued(): boolean {
    return !!this._queuedBy;
  }

  public get queuedBy(): string | null {
    return this._queuedBy;
  }

  public async getAsync(): Promise<SpotifyQueueResponse | null> {
    try {
      const response = await this.spotify.api.fetch<SpotifyQueueResponse>(
        "/me/player/queue"
      );

      if (!response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error("Error getting Spotify Queue", error);
      return null;
    }
  }

  public async getSummaryAsync(): Promise<SpotifyTrackSummary[]> {
    try {
      const queue = await this.getAsync();

      if (!queue) {
        return [];
      }

      let summary: SpotifyTrackSummary[] = queue.queue
        .map((track) => trackSummaryFromDetails(track))
        .filter((summary): summary is SpotifyTrackSummary => !!summary);

      return summary
    } catch (error) {
      logger.error("Error getting Spotify Queue Summary", error);
      throw error;
    }
  }

  public getTracksQueuedByUser(username?: string) {
    const user = cleanUsername(username);
    return this.userQueues.filter(
      (queue) => !user.length || queue.queuedBy === user
    );
  }

  public async pushAsync(
    track: SpotifyTrackSummary,
    username?: string,
    allowDuplicates: boolean = false
  ) {
    const { uri } = track;

    try {
      if (!allowDuplicates && this.trackInQueue(track.uri)) {
        throw new Error("Song already exists in queue");
      }
      await this.spotify.api.fetch(`/me/player/queue?uri=${uri}`, "POST");

      this._userQueues.push({
        track,
        queuedBy: cleanUsername(username),
        skip: false,
      });
    } catch (error) {
      logger.error("Error pushing song to Spotify Queue", error);
      throw error;
    }
  }

  public async findIndexAsync(songUri: string) {
    const queue = await this.getAsync();

    if (!queue) return -1;

    return [queue.currently_playing, ...queue.queue].findIndex(
      (a) => a.uri === songUri
    );
  }

  public cancelUserQueues(
    username?: string,
    onlyLast: boolean = false
  ): SpotifyTrackSummary[] {
    const cleanedUsername = cleanUsername(username);
    const output: SpotifyTrackSummary[] = [];

    for (let i = this._userQueues.length - 1; i >= 0; i--) {
      const { queuedBy, skip } = this._userQueues[i];

      if ((username && queuedBy !== cleanedUsername) || skip) continue;

      this._userQueues[i].skip = true;
      output.push(this._userQueues[i].track);

      if (onlyLast) break; // Only skip one match if onlyLast is true
    }

    return output;
  }

  private trackInQueue = (trackUri: string) =>
    this.userQueues.some((queue) => queue.track.uri === trackUri);
}
