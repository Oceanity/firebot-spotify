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

  private _trackId: string | null = null;
  private _lyricsData: LyricsData | null = null;
  private _currentLine: LyricsLine | null = null;
  private _queuedLine: LyricsLine | null = null;

  private tickListener = (progressMs: number) =>
    this.handleNextTick(progressMs);

  public constructor(spotifyService: SpotifyService) {
    super();

    this.spotify = spotifyService;
  }

  public get trackHasLyrics(): boolean {
    return !!this._lyricsData;
  }

  public get currentLine(): string {
    return this._currentLine?.words ?? "";
  }

  public async init() {
    this.spotify.player.on("track-changed", async (track) => {
      this._lyricsData = null;
      this._trackId = track.id;

      // set current line to empty
      this._currentLine = {
        startTimeMs: "0",
        words: "",
        syllables: [],
        endTimeMs: "0",
      };
      this.emitLyricsChanged(this._currentLine);

      if (!this._lyricsData || this._trackId !== track.id) {
        if (!(await lyricsFileExistsAsync(track.id))) return;

        logger.info(
          `Lyrics file exists for ${track.artists[0].name} - ${track.name}`
        );

        const path = lyricsFilePath(track.id);
        const db = new DbService(path, true, false);

        const lyricsData = await db.getAsync<LyricsData>("/");

        if (!lyricsData) {
          this.spotify.player.off("tick", this.tickListener);
          return;
        }

        this._lyricsData = lyricsData;

        this.spotify.player.on("tick", this.tickListener);
        return;
      }
    });
  }

  public async saveLyrics(id: string, lyricsData: LyricsData) {
    const filePath = lyricsFilePath(id);

    const db = new DbService(filePath, true, false);
    const response = await db.pushAsync(`/`, lyricsData);

    // If current track, let's make it live
    if (this._trackId === id) {
      logger.info("Found current track lyrics midway");

      this._lyricsData = lyricsData;

      this.spotify.player.on("tick", this.tickListener);
    }

    return response;
  }

  private async handleNextTick(progressMs: number): Promise<void> {
    const { _lyricsData: lyricsData } = this;
    try {
      if (
        !this.spotify.player.track ||
        !lyricsData ||
        this._trackId !== this.spotify.player.track.id
      ) {
        logger.info("Stopping lyric tick handler");
        this.spotify.player.off("tick", this.tickListener);
        return;
      }

      // Don't update if line is already on its way
      if (this._queuedLine || !this.spotify.player.isPlaying) return;

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
    this._queuedLine = null;
    this.emitLyricsChanged(this._currentLine);
  }

  private emitLyricsChanged(line: LyricsLine) {
    this.emit("lyrics-changed", line);
    eventManager.triggerEvent("oceanity-spotify", "lyrics-changed", line);
  }

  private readonly startLine: LyricsLine = {
    startTimeMs: "0",
    words: "",
    syllables: [],
    endTimeMs: "0",
  };

  private readonly endLine: LyricsLine = {
    startTimeMs: "9999999999",
    words: "",
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
