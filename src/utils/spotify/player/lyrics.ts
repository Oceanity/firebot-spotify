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

  private _lineQueued: boolean = false;
  private _trackId: string | null = null;
  private _lyricsData: LyricsData | null = null;
  private _currentLine: LyricsLine | null = null;
  private _queuedLine: LyricsLine | null = null;

  private tickListener = () => this.handleNextTick();

  public constructor(spotifyService: SpotifyService) {
    super();

    this.spotify = spotifyService;
  }

  public get currentLine(): string {
    return this._currentLine?.words ?? "";
  }

  public async init() {
    this.spotify.player.on("track-changed", async (track) => {
      this._lyricsData = null;
      this._lineQueued = false;

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

        if (lyricsData) {
          this._trackId = track.id;
          this._lyricsData = lyricsData;

          this.spotify.player.on("tick", this.tickListener);
          return;
        }

        this.spotify.player.off("tick", this.tickListener);
      }
    });
  }

  private async handleNextTick(): Promise<void> {
    const { _lyricsData: lyricsData } = this;
    try {
      if (
        !this.spotify.player.track ||
        !lyricsData ||
        this._trackId !== this.spotify.player.track.id
      ) {
        this.spotify.player.off("tick", this.tickListener);
        return;
      }

      // Don't update if line is already on its way
      if (this._queuedLine) return;

      const currentMs = this.spotify.player.track.positionMs;

      this.checkNextLine(currentMs);

      if (!this._queuedLine) {
        this.checkPreviousLine(currentMs);
      }
    } catch (error) {
      logger.error("Error handling next tick", error);
    }
  }

  private checkNextLine(currentMs: number) {
    if (!this._lyricsData) return;

    const { lines } = this._lyricsData.lyrics;

    const nextLine = lines
      .filter((line) => parseInt(line.startTimeMs) > currentMs)
      .reduce(
        (prev, curr) =>
          parseInt(curr.startTimeMs) < parseInt(prev.startTimeMs) ? curr : prev,
        this.endLine
      );

    const offset = parseInt(nextLine.startTimeMs) - currentMs;

    if (
      offset < 1000 &&
      this._queuedLine?.startTimeMs !== nextLine.startTimeMs
    ) {
      logger.info(`Found upcoming line\n${JSON.stringify(nextLine)}`);

      this._queuedLine = nextLine;
      this.queueNextLine(offset, nextLine);
    }
  }

  private checkPreviousLine(currentMs: number) {
    if (!this._lyricsData) return;

    const { lines } = this._lyricsData.lyrics;

    const lastLine = lines
      .filter((line) => parseInt(line.startTimeMs) < currentMs)
      .reduce(
        (prev, curr) =>
          parseInt(curr.startTimeMs) > parseInt(prev.startTimeMs) ? curr : prev,
        this.startLine
      );

    if (
      !this._currentLine ||
      parseInt(lastLine.startTimeMs) > parseInt(this._currentLine.startTimeMs)
    ) {
      this._currentLine == lastLine;
      this.queueNextLine(0, lastLine);
    }
  }

  private async queueNextLine(
    delayMs: number,
    line: LyricsLine
  ): Promise<void> {
    if (this._lineQueued) return;
    const id = this._trackId;
    this._lineQueued = true;

    await delay(delayMs);

    // ensure track is still correct
    if (id !== this._trackId) return;

    this._currentLine = line;
    this._queuedLine = null;
    this.emitLyricsChanged(this._currentLine);

    this._lineQueued = false;
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
    startTimeMs: "999999999",
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

  if (await pathExists(filePath)) {
    return true;
  }

  return false;
}
