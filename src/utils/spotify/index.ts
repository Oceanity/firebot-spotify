import SpotifyApiService from "@utils/spotify/api";
import SpotifyAuthService from "@utils/spotify/auth";
import SpotifyPlayerService from "@utils/spotify/player";
import SpotifyProfileService from "@utils/spotify/me";

export class SpotifyService {
  public readonly api: SpotifyApiService;
  public readonly auth: SpotifyAuthService;
  public readonly me: SpotifyProfileService;
  public readonly player: SpotifyPlayerService;

  constructor() {
    this.api = new SpotifyApiService(this);
    this.auth = new SpotifyAuthService(this);
    this.me = new SpotifyProfileService(this);
    this.player = new SpotifyPlayerService(this);
  }
}
