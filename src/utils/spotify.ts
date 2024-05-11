import Store from "@utils/store";
import { Request, Response } from "express";
import { RegisterAllEndpoints } from "@/utils/webServer";
import { randomUUID } from "crypto";
import open from "open";
import DbUtils from "./db";

export default class SpotifyUtils {
  private static readonly authUrl: string =
    "https://accounts.spotify.com/authorize";
  private static readonly scopes: string[] = [
    "app-remote-control",
    "streaming",
    "user-modify-playback-state",
    "user-read-currently-playing",
    "user-read-email",
    "user-read-playback-position",
    "user-read-playback-state",
    "user-read-private",
    "user-read-recently-played",
  ];
  private static readonly callbackPath: string = "/oauth/callback";

  public static registerEndpoints() {
    RegisterAllEndpoints([
      [this.callbackPath, "GET", this.oauthCallbackHandler],
    ]);
  }

  //#region Endpoint Handlers
  private static async oauthCallbackHandler(req: Request, res: Response) {
    const { code, state } = req.query;

    Store.Modules.logger.info(code as string);

    if ((state as string) !== Store.State) {
      res.status(400);
      res.send(
        "<h1>Spotify Login Failed</h1><p>The state does not match the state in the request, this could be a sign of a replay attack.</p>"
      );
      return;
    }

    Store.SpotifyToken = code as string;
    await DbUtils.push<string>("./db/spotify", "token", Store.SpotifyToken);

    res.send(
      "<h1>Spotify Login Successful!</h1><p>You may now close this window.</p>"
    );
  }
  //#endregion

  //#region Public Methods
  public static openLoginPage() {
    Store.Modules.logger.info("Opening Spotify Auth Page");

    Store.State = randomUUID();
    const params = {
      response_type: "code",
      client_id: Store.Parameters.spotifyClientId,
      scope: this.scopes.join(" "),
      redirect_uri: `${Store.GetWebserverUrl()}/oauth/callback`,
      state: Store.State,
    };
    const qs = new URLSearchParams(params).toString();

    Store.Modules.logger.info(qs);

    open(`${this.authUrl}?${qs}`);
  }
  //#endregion
}
