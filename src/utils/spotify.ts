import Store from "@utils/store";
import { Request, Response } from "express";
import { RegisterAllEndpoints } from "@/utils/webServer";
import { randomUUID } from "crypto";
import open from "open";

type SpotifyOptions = {
  port: number;
  prefix: string;
  callbackPath: string;
};

export default class Spotify {
  // Readonly props
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

  public static registerEndpoints() {
    RegisterAllEndpoints([
      [Store.CallbackPath, "GET", this.oauthCallbackHandler],
    ]);
  }

  //#region Endpoint Handlers
  private static async oauthCallbackHandler(req: Request, res: Response) {
    const { RedirectUri, SpotifyApplication, SpotifyAuth } = Store;
    const { code, state } = req.query;

    if (state !== SpotifyAuth.state) {
      res.send(
        "<h1>Spotify Login Failed</h1><p>The state does not match the state in the request, this could be a sign of a replay attack.</p>"
      );
      return;
    }

    SpotifyAuth.code = code as string;
    Store.Modules.logger.info(SpotifyAuth.code);

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code: SpotifyAuth.code,
      redirect_uri: RedirectUri,
    }).toString();

    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${SpotifyApplication.clientId}:${SpotifyApplication.clientSecret}`
        ).toString("base64")}`,
      },
      body,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          res.send(
            `<h1>Spotify Login Failed</h1><p>There was an error getting a token from the code provided.</p><p>${data.error}</p>`
          );
          return;
        }
        [
          SpotifyAuth.accessToken,
          SpotifyAuth.refreshToken,
          SpotifyAuth.expiresIn,
        ] = [data.access_token, data.refresh_token, data.expires_in];

        res.send(
          "<h1>Spotify Login Successful!</h1><p>You may now close this window.</p>"
        );

        Store.Modules.logger.info(SpotifyAuth.accessToken ?? "");

        return Store.SpotifyAuth.accessToken;
      })
      .catch((err) => {
        Store.Modules.logger.info(JSON.stringify(err));
        res.send(
          "<h1>Spotify Login Failed</h1><p>There was an error getting a token from the code provided.</p>"
        );
      });
  }

  private static async requestSongHandler(req: Request, res: Response) {
    const { search } = req.query;
    const { accessToken } = Store.SpotifyAuth;

    if (!accessToken) {
      res.status(401).send("Unauthorized");
      return;
    }

    res.send(true);
  }
  //#endregion

  public static async getActiveDeviceAsync() {
    const { accessToken } = Store.SpotifyAuth;

    if (!accessToken) return null;

    const response: SpotifyGetDevicesResponse = await (
      await fetch("https://api.spotify.com/v1/me/player/devices", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    ).json();
    return response.devices.find((d) => d.is_active);
  }

  public static async findTrackAsync(search: string) {
    const { accessToken } = Store.SpotifyAuth;

    if (!accessToken) return null;

    const params = new URLSearchParams({
      q: search,
      type: "track",
      limit: "1",
    }).toString();

    const response = await (
      await fetch(`https://api.spotify.com/v1/search?${params}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
    ).json();
    return response.tracks.items[0];
  }

  public static async enqueueTrackAsync(deviceId: string, trackUri: string) {
    const { accessToken } = Store.SpotifyAuth;
    if (!accessToken) return null;

    const response = await fetch(
      `https://api.spotify.com/v1/me/player/queue?uri=${trackUri}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device_id: deviceId,
          uri: trackUri,
        }),
      }
    );
    return response.status === 204;
  }

  //#region Public Methods
  public static async openLoginPage() {
    const { RedirectUri } = Store;
    const { SpotifyAuth } = Store;
    const { clientId } = Store.SpotifyApplication;

    SpotifyAuth.state = randomUUID();

    const queryString = new URLSearchParams({
      response_type: "code",
      client_id: clientId,
      scope: this.scopes.join("%20"),
      redirect_uri: RedirectUri,
      state: SpotifyAuth.state,
    }).toString();

    open(`https://accounts.spotify.com/authorize?${queryString}`);

    return;
  }
  //#endregion
}
