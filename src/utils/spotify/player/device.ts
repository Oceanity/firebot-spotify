import { logger } from "@/utils/firebot";
import { SpotifyService } from "@utils/spotify";

export class SpotifyDeviceService {
  private readonly spotify: SpotifyService;

  private _id?: string;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async init() {
    this.spotify.player.state.on(
      "device-id-state-changed",
      this.updateDeviceIdHandler
    );
  }

  //#region Getters
  public get id(): string {
    return this._id ?? "";
  }
  //#endregion

  //#region Event Handlers
  private updateDeviceIdHandler = async (id?: string) => {
    this.updateCurrentDeviceId(id);
  };
  //#endregion

  private updateCurrentDeviceId(id?: string) {
    logger.info(`Spotify Device ID changed to ${id} from ${this._id}`);
    this._id = id;
  }
}
