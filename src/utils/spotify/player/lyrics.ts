import DbService from "@/utils/db";
import { logger } from "@/utils/firebot";
import { delay } from "@/utils/timing";
import { SpotifyService } from "@utils/spotify";
import { EventEmitter } from "events";
import { ensureDir, pathExists } from "fs-extra";
import { dirname, resolve } from "path";

export const lyricsPath = "./lyrics";

export class SpotifyLyricsService extends EventEmitter {
  private readonly spotify: SpotifyService;

  private _trackId?: string;
  private _lines?: FormattedLyricsLine[];
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

  public get trackHasLyricsFile(): Promise<boolean> {
    return LyricsHelpers.fileExistsAsync(this._trackId ?? "");
  }

  public get trackHasLyrics(): boolean {
    return (
      !!this._lines && this._trackId === this.spotify.player.trackService.id
    );
  }

  public get currentLine(): string {
    return this._currentLine?.words ?? "";
  }

  private tickHandler = (progressMs: number) => this.handleNextTick(progressMs);

  private trackChangedHandler = async (track?: SpotifyTrackDetails) => {
    this._lines = undefined;
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

    if (!(await LyricsHelpers.fileExistsAsync(track.id))) return;

    const path = LyricsHelpers.filePathFromId(track.id);
    const db = new DbService(path, true, false);

    const lyricsData = await db.getAsync<LyricsData>("/");

    this._lines = this.formatLines(lyricsData);

    // Enable tick listener if we have lyrics
    return lyricsData
      ? this.spotify.player.state.on("tick", this.tickHandler)
      : this.spotify.player.state.off("tick", this.tickHandler);
  };

  public formatLines = (lyricsData?: LyricsData) =>
    (this._lines = lyricsData
      ? lyricsData.lyrics.lines.map((l) => ({
          startTimeMs: Number(l.startTimeMs),
          words: l.words,
          syllables: l.syllables,
          endTimeMs: Number(l.endTimeMs),
        }))
      : undefined);

  public async saveLyrics(id: string, lyricsData: LyricsData) {
    const filePath = LyricsHelpers.filePathFromId(id);

    const db = new DbService(filePath, true, false);
    const response = await db.pushAsync(`/`, lyricsData);

    // If current track, let's make it live
    if (this._trackId === id) {
      this.formatLines(lyricsData);
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

      if (!this.spotify.player.isPlaying) return this.clearCurrentLine();

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
    if (!this._lines) return;

    const nextLine = this._lines
      .filter((line) => line.startTimeMs > currentMs)
      .reduce(
        (prev, curr) => (curr.startTimeMs < prev.startTimeMs ? curr : prev),
        this.endLine
      );

    const offset = nextLine.startTimeMs - currentMs;

    if (
      offset < 1000 &&
      this._queuedLine?.startTimeMs !== nextLine.startTimeMs
    ) {
      this.queueNextLine(offset, nextLine);
    }
  }

  private checkPreviousLine(currentMs: number) {
    if (!this._lines) return;

    const lastLine = this._lines
      .filter((line) => line.startTimeMs < currentMs)
      .reduce(
        (prev, curr) => (curr.startTimeMs > prev.startTimeMs ? curr : prev),
        this.startLine
      );

    if (
      !this._currentLine ||
      lastLine.startTimeMs > this._currentLine.startTimeMs
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

  private clearCurrentLine() {
    this._currentLine = {
      startTimeMs: "0",
      words: "",
      syllables: [],
      endTimeMs: "0",
    };
    this._queuedLine = undefined;

    this.emitLyricsChanged(this._currentLine);
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

export class LyricsHelpers {
  public static filePathFromId = (id: string) =>
    resolve(__dirname, lyricsPath, `${id}.json`);

  public static async fileExistsAsync(id: string) {
    const filePath = LyricsHelpers.filePathFromId(id);

    await ensureDir(dirname(filePath));

    return await pathExists(filePath);
  }
}
