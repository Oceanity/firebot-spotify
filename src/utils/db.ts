import { JsonDB } from "node-json-db";
import Store from "@utils/store";
import { ensureDir } from "fs-extra";
import { dirname, resolve } from "path";
import Fuse, { IFuseOptions } from "fuse.js";

const { Modules } = Store;

type PatchResults<T> = {
  found: T;
  replaced: T;
};

export default class DbUtils {
  static setup = async (path: string = "./db/firebotDb"): Promise<JsonDB> => {
    const { JsonDb } = Modules;

    Modules.logger.info("Hi");

    if (!path.includes(__dirname)) path = resolve(__dirname, path);

    Modules.logger.info("This");

    await ensureDir(dirname(path));

    Modules.logger.info("Is");

    // @ts-expect-error ts2351: JsonDB is a class, not a constructor function
    return new JsonDb(path, true, true);
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
      Modules.logger.error(`Failed to get "${route}" from "${path}"`);
      return undefined;
    }
  };

  static getRandom = async <T>(
    path: string,
    route: string,
    defaults?: T[]
  ): Promise<T | undefined> => {
    const { getRandomInt } = Modules.utils;

    const choices = await this.getAsync<T[]>(path, route, defaults);

    if (!choices || !choices.length) {
      Modules.logger.error(`Failed to get random "${route}" from "${path}"`);
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
    const db = await this.setup(path);
    Modules.logger.info(
      `Pushing ${JSON.stringify(data)} to ${route} in ${path}`
    );

    try {
      await db.push(route, data, override);
      return true;
    } catch (err) {
      Modules.logger.error(`Could not push to "${route}" in "${path}"`);
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
      Modules.logger.error(`Could not increment "${route}" in "${path}"`);
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
        Modules.logger.error("Could not find item to update");
        return undefined;
      }

      db.push(`${route}[${results[0].refIndex}]`, replace);

      return {
        found: results[0].item,
        replaced: replace,
      };
    } catch (err) {
      Modules.logger.error(`Failed to update "${route}" in "${path}"`);
      return undefined;
    }
  };
}
