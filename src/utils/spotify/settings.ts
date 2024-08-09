import { JsonDB } from "node-json-db";
import { jsonDb } from "@oceanity/firebot-helpers/firebot";
import { SpotifyService } from ".";
import { dirname, resolve } from "path";
import { ensureDir } from "fs-extra";

type SpotifySettings = {
  bannedArtists: string[];
};

export class SpotifySettingsService {
  private readonly spotify: SpotifyService;
  private readonly path: string;

  private _db?: JsonDB;
  private _ready: boolean = false;

  constructor(
    spotifyService: SpotifyService,
    path: string = "./oceanitySpotifySettings.json"
  ) {
    this.path = resolve(__dirname, path);
    this.spotify = spotifyService;
  }

  public async init() {
    if (this._ready) return;

    const dir = dirname(this.path);

    await ensureDir(dir);

    // @ts-expect-error ts18046
    this._db = new jsonDb(this.path, true, true);
    this._ready = true;
  }

  public async getSetting(key: keyof SpotifySettings) {
    await this.init();

    return (await this._db?.getData(key)) as SpotifySettings[typeof key];
  }

  public async saveSetting(
    key: keyof SpotifySettings,
    value: SpotifySettings[typeof key]
  ) {
    await this.init();

    await this._db?.push(key, value);
  }
}
