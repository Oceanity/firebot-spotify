import DbService from "@/utils/db";
import { eventManager, logger } from "@/utils/firebot";
import { delay } from "@/utils/timing";
import { SpotifyService } from "@utils/spotify";
import { EventEmitter } from "events";
import { ensureDir, pathExists } from "fs-extra";
import { dirname, resolve } from "path";

export const lyricsPath = "./lyrics";

export class SpotifyLyricsService extends EventEmitter {
  private readonly spotify: SpotifyService;

  private _trackId?: string;
  private _lyricsData?: LyricsData;
  private _currentLine?: LyricsLine;
  private _queuedLine?: LyricsLine;

  public constructor(spotifyService: SpotifyService) {
    super();

    this.spotify = spotifyService;
  }

  public async init() {
    this.spotify.player.state.on(
      "track-state-changed",
      this.trackChangedHandler
    );
  }

  public get trackHasLyrics(): boolean {
    return (
      this.spotify.player.isPlaying &&
      !!this._lyricsData &&
      this._trackId === this.spotify.player.trackService.id
    );
  }

  public get currentLine(): string {
    return this._currentLine?.words ?? "";
  }

  private tickHandler = (progressMs: number) => this.handleNextTick(progressMs);

  private trackChangedHandler = async (track?: SpotifyTrackDetails) => {
    this._lyricsData = undefined;
    this._trackId = track?.id;

    // set current line to empty
    this._currentLine = {
      startTimeMs: "0",
      words: "",
      syllables: [],
      endTimeMs: "0",
    };
    this.emitLyricsChanged(this._currentLine);

    if (!track) return;

    if (!(await lyricsFileExistsAsync(track.id))) return;

    const path = lyricsFilePath(track.id);
    const db = new DbService(path, true, false);

    const lyricsData = await db.getAsync<LyricsData>("/");

    if (!lyricsData) {
      this.spotify.player.state.off("tick", this.tickHandler);
      return;
    }

    this._lyricsData = lyricsData;

    this.spotify.player.state.on("tick", this.tickHandler);
    return;
  };

  public async saveLyrics(id: string, lyricsData: LyricsData) {
    const filePath = lyricsFilePath(id);

    const db = new DbService(filePath, true, false);
    const response = await db.pushAsync(`/`, lyricsData);

    // If current track, let's make it live
    if (this._trackId === id) {
      this._lyricsData = lyricsData;

      this.spotify.player.state.on("tick", this.tickHandler);
    }

    return response;
  }

  private async handleNextTick(progressMs: number): Promise<void> {
    try {
      if (!this.trackHasLyrics) {
        this.spotify.player.state.off("tick", this.tickHandler);
        return;
      }

      // Don't update if line is already on its way
      if (!!this._queuedLine) return;

      this.checkNextLine(progressMs);

      if (!this._queuedLine) {
        this.checkPreviousLine(progressMs);
      }
    } catch (error) {
      logger.error("Error handling next tick", error);
    }
  }

  private checkNextLine(currentMs: number) {
    if (!this._lyricsData) return;

    const { lines } = this._lyricsData.lyrics;

    const nextLine = lines
      .filter((line) => Number(line.startTimeMs) > currentMs)
      .reduce(
        (prev, curr) =>
          Number(curr.startTimeMs) < Number(prev.startTimeMs) ? curr : prev,
        this.endLine
      );

    const offset = Number(nextLine.startTimeMs) - currentMs;

    if (
      offset < 1000 &&
      this._queuedLine?.startTimeMs !== nextLine.startTimeMs
    ) {
      this.queueNextLine(offset, nextLine);
    }
  }

  private checkPreviousLine(currentMs: number) {
    if (!this._lyricsData) return;

    const { lines } = this._lyricsData.lyrics;

    const lastLine = lines
      .filter((line) => Number(line.startTimeMs) < currentMs)
      .reduce(
        (prev, curr) =>
          Number(curr.startTimeMs) > Number(prev.startTimeMs) ? curr : prev,
        this.startLine
      );

    if (
      !this._currentLine ||
      Number(lastLine.startTimeMs) > Number(this._currentLine.startTimeMs)
    ) {
      this._currentLine == lastLine;
      this.queueNextLine(0, lastLine);
    }
  }

  private async queueNextLine(
    delayMs: number,
    line: LyricsLine
  ): Promise<void> {
    if (this._queuedLine) return;
    const id = this._trackId;
    this._queuedLine = line;

    await delay(delayMs);

    // ensure track is still correct
    if (id !== this._trackId) return;

    this._currentLine = line;
    this._queuedLine = undefined;
    this.emitLyricsChanged(this._currentLine);
  }

  private emitLyricsChanged(line: LyricsLine) {
    this.emit("lyrics-changed", line);
    this.spotify.events.trigger("lyrics-changed", line);
  }

  private readonly startLine: LyricsLine = {
    startTimeMs: "0",
    words: "♪",
    syllables: [],
    endTimeMs: "0",
  };

  private readonly endLine: LyricsLine = {
    startTimeMs: "9999999999",
    words: "♪",
    syllables: [],
    endTimeMs: "0",
  };
}

export const lyricsFilePath = (id: string) =>
  resolve(__dirname, lyricsPath, `${id}.json`);

export async function lyricsFileExistsAsync(id: string): Promise<boolean> {
  const filePath = lyricsFilePath(id);

  await ensureDir(dirname(filePath));

  return await pathExists(filePath);
}
