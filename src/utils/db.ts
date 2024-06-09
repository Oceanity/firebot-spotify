import { JsonDB } from "node-json-db";
import { ensureDir } from "fs-extra";
import { jsonDb, logger, utils } from "@utils/firebot";
import { dirname, resolve } from "path";
import Fuse, { IFuseOptions } from "fuse.js";

type PatchResults<T> = {
  found: T;
  replaced: T;
};

export default class DbService {
  private _ready: boolean = false;
  private _path: string;
  private _autoSave: boolean;
  private _humanReadable: boolean;
  private _db?: JsonDB;

  public constructor(
    path: string,
    saveOnWrite: boolean = true,
    humanReadable: boolean = false
  ) {
    if (!path.includes(__dirname)) path = resolve(__dirname, path);
    this._path = path;
    this._autoSave = saveOnWrite;
    this._humanReadable = humanReadable;
  }

  public get ready(): boolean {
    return this._ready;
  }

  public async init() {
    if (this._ready) return;
    await ensureDir(dirname(this._path));

    // @ts-expect-error ts18046
    this._db = new jsonDb(this._path, this._autoSave, this._humanReadable);

    this._ready = true;
  }

  public async getAsync<T>(
    route: string,
    defaults?: T | T[]
  ): Promise<T | undefined> {
    try {
      await this.init();

      return this._db?.getData(route) as T;
    } catch (err) {
      if (defaults) this._db?.push(route, defaults, true);
      logger.error(`Failed to get "${route}" from "${this._path}"`);
      return undefined;
    }
  }

  public async getRandom<T>(
    route: string,
    defaults?: T[]
  ): Promise<T | undefined> {
    const { getRandomInt } = utils;

    const choices = await this.getAsync<T[]>(route, defaults);

    if (!choices || !choices.length) {
      logger.error(`Failed to get random "${route}" from "${this._path}"`);
      return undefined;
    }

    const random = getRandomInt(0, choices.length - 1);
    return choices[random];
  }

  public async pushAsync<T>(
    route: string,
    data: T,
    override: boolean = false
  ): Promise<boolean> {
    try {
      await this.init();

      await this._db?.push(route, data, override);
      return true;
    } catch (err) {
      logger.error(`Could not push to "${route}" in "${this._path}"`);
      return false;
    }
  }

  public async mutate<T>(
    route: string,
    data: T,
    callback: (oldData: T, newData: T) => T,
    defaults: T
  ): Promise<boolean> {
    try {
      await this.init();

      const existing = (await this.getAsync<T>(route, defaults)) ?? defaults;
      await this.pushAsync(route, callback(existing, data), true);
      return true;
    } catch (err) {
      logger.error(`Could not increment "${route}" in "${this._path}"`);
      return false;
    }
  }

  public async update<T>(
    route: string,
    search: string,
    replace: T,
    fuseOptions?: IFuseOptions<T>
  ): Promise<PatchResults<T> | undefined> {
    try {
      await this.init();

      const data = await this._db?.getData(route);
      const fuse = new Fuse(data, fuseOptions);
      const results = fuse.search(search);

      if (!results) {
        logger.error("Could not find item to update");
        return undefined;
      }

      await this._db?.push(`${route}[${results[0].refIndex}]`, replace);

      return {
        found: results[0].item,
        replaced: replace,
      };
    } catch (err) {
      logger.error(`Failed to update "${route}" in "${this._path}"`);
      return undefined;
    }
  }
}
