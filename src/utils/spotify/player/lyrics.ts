import { logger } from "@utils/firebot";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import { delay } from "@utils/time";
import { SpotifyService } from "@utils/spotify";
import { EventEmitter } from "events";
import { ensureDir, pathExists, readFile, writeFile } from "fs-extra";
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
      "track-changed",
      (track?: SpotifyTrackDetails) => {
        this.checkNextTrackAsync(track);
      }
    );
  }

  public get trackHasLyricsFile(): Promise<boolean> {
    return LyricsHelpers.lyricsFileExistsAsync(this._trackId ?? "");
  }

  public get trackHasLyrics(): boolean {
    return !!this._lines && this._trackId === this.spotify.player.track.id;
  }

  public get currentLine(): string {
    return this._currentLine?.words ?? "";
  }

  private tickHandler = (progressMs: number) => this.handleNextTick(progressMs);

  public checkNextTrackAsync = async (track?: SpotifyTrackDetails) => {
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

    await this.loadLyricsFileAsync(track?.id);

    // Enable tick listener if we have lyrics
    return this._lines
      ? this.spotify.player.state.on("tick", this.tickHandler)
      : this.spotify.player.state.off("tick", this.tickHandler);
  };

  public async loadLyricsFileAsync(id?: string) {
    if (!id || !(await LyricsHelpers.lyricsFileExistsAsync(id))) return;

    const path = LyricsHelpers.lyricsFilePathFromId(id);

    const lyricsFile = await readFile(path, "utf8").catch((error) => {
      throw error;
    });
    const lyricsData = JSON.parse(lyricsFile) as LyricsData;

    this._lines = this.formatLines(lyricsData);
  }

  public formatLines = (lyricsData?: LyricsData) =>
    (this._lines = lyricsData
      ? lyricsData.lyrics.lines.map((l) => ({
          ...l,
          startTimeMs: Number(l.startTimeMs),
          endTimeMs: Number(l.endTimeMs),
        }))
      : undefined);

  public async saveLyrics(id: string, lyricsData: LyricsData) {
    const filePath = LyricsHelpers.lyricsFilePathFromId(id);

    try {
      logger.info(`Saving lyrics to ${filePath}`);

      await ensureDir(dirname(filePath));
      await writeFile(filePath, JSON.stringify(lyricsData));

      // If current track, let's make it live
      if (this._trackId === id) {
        this.formatLines(lyricsData);
        this.spotify.player.state.on("tick", this.tickHandler);
      }

      return true;
    } catch (error) {
      throw error;
    }
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
  public static lyricsFilePathFromId = (id?: string): string =>
    id ? resolve(__dirname, lyricsPath, `${id}.json`) : "";

  public static async lyricsFileExistsAsync(
    id?: string | null
  ): Promise<boolean> {
    if (!id) return false;

    const filePath = this.lyricsFilePathFromId(id);

    await ensureDir(dirname(filePath));

    return await pathExists(filePath);
  }

  public static async loadLyricsFileAsync(
    id?: string
  ): Promise<LyricsData | null> {
    try {
      if (!id || !(await this.lyricsFileExistsAsync(id))) return null;

      const path = this.lyricsFilePathFromId(id);

      const rawData = await readFile(path, "utf-8");
      const lyricsData = JSON.parse(rawData) as LyricsData;

      return lyricsData;
    } catch (error) {
      logger.error(getErrorMessage(error), error);
      return null;
    }
  }
}
