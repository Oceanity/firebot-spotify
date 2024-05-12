import Spotify from "@/utils/spotify";
import { RegisterAllEndpoints } from "@/utils/webServer";
import { Request, Response } from "express";

export default class SpotifyGateway {
  public static registerEndpoints() {
    RegisterAllEndpoints([["/request", "GET", this.requestSongHandler]]);
  }

  private static async oauthCallbackHandler(_req: Request, res: Response) {
    res.send("Hi");
  }

  private static async requestSongHandler(req: Request, res: Response) {
    await Spotify.refreshTokenAsync();
    const device = await Spotify.getActiveDeviceAsync();
    const track = await Spotify.findTrackAsync(req.query.q as string);
    if (!device || !track) {
      res.send(null);
      return;
    }
    await Spotify.enqueueTrackAsync(device?.id as string, track?.uri as string);
    res.send(track);
  }
}
