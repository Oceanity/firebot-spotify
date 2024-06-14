import { logger } from "@/utils/firebot";
import { SpotifyService } from "@utils/spotify";

export class SpotifyDeviceService {
  private readonly spotify: SpotifyService;

  private _id?: string;

  constructor(spotify: SpotifyService) {
    this.spotify = spotify;
  }

  public async init() {
    this.spotify.player.on("device-changed", this.updateDeviceIdHandler);
  }

  public get id(): string {
    return this._id ?? "";
  }

  private async updateDeviceIdHandler(id?: string) {
    logger.info(`Changing active Device ID to ${id}`);
    this._id = id;
  }
}
