export class SpotifyDeviceService {
  private _id?: string;

  constructor() {}

  //#region Getters
  public get isAvailable(): boolean {
    return !!this._id;
  }

  public get id(): string {
    return this._id ?? "";
  }
  //#endregion

  public updateId(id?: string) {
    this._id = id;
  }
}
