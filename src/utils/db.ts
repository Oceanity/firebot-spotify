import { JsonDB } from "node-json-db";
import { ensureDir } from "fs-extra";
import { jsonDb, logger, utils } from "@utils/firebot";
import { dirname, resolve } from "path";
import Fuse, { IFuseOptions } from "fuse.js";

type PatchResults<T> = {
  found: T;
  replaced: T;
};

export default class DbUtils {
  static setup = async (path: string = "./db/firebotDb"): Promise<JsonDB> => {
    if (!path.includes(__dirname)) path = resolve(__dirname, path);

    await ensureDir(dirname(path));

    // @ts-expect-error ts18046
    return new jsonDb(path, true, true);
  };

  static getAsync = async <T>(
    path: string,
    route: string,
    defaults?: T | T[]
  ): Promise<T | undefined> => {
    const db = await this.setup(path);

    try {
      return db.getData(route) as T;
    } catch (err) {
      if (defaults) db.push(route, defaults, true);
      logger.error(`Failed to get "${route}" from "${path}"`);
      return undefined;
    }
  };

  static getRandom = async <T>(
    path: string,
    route: string,
    defaults?: T[]
  ): Promise<T | undefined> => {
    const { getRandomInt } = utils;

    const choices = await this.getAsync<T[]>(path, route, defaults);

    if (!choices || !choices.length) {
      logger.error(`Failed to get random "${route}" from "${path}"`);
      return undefined;
    }

    const random = getRandomInt(0, choices.length - 1);
    return choices[random];
  };

  static push = async <T>(
    path: string,
    route: string,
    data: T,
    override: boolean = false
  ): Promise<boolean> => {
    logger.info(`Pushing ${JSON.stringify(data)} to ${route} in ${path}`);
    const db = await this.setup(path);

    try {
      await db.push(route, data, override);
      return true;
    } catch (err) {
      logger.error(`Could not push to "${route}" in "${path}"`);
      return false;
    }
  };

  static mutate = async <T>(
    path: string,
    route: string,
    data: T,
    callback: (oldData: T, newData: T) => T,
    defaults: T
  ): Promise<boolean> => {
    try {
      const existing =
        (await this.getAsync<T>(path, route, defaults)) ?? defaults;
      await this.push(path, route, callback(existing, data), true);
      return true;
    } catch (err) {
      logger.error(`Could not increment "${route}" in "${path}"`);
      return false;
    }
  };

  static update = async <T>(
    path: string,
    route: string,
    search: string,
    replace: T,
    fuseOptions?: IFuseOptions<T>
  ): Promise<PatchResults<T> | undefined> => {
    const db = await this.setup(path);

    try {
      const data = await db.getData(route);
      const fuse = new Fuse(data, fuseOptions);
      const results = fuse.search(search);

      if (!results) {
        logger.error("Could not find item to update");
        return undefined;
      }

      db.push(`${route}[${results[0].refIndex}]`, replace);

      return {
        found: results[0].item,
        replaced: replace,
      };
    } catch (err) {
      logger.error(`Failed to update "${route}" in "${path}"`);
      return undefined;
    }
  };
}
