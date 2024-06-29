import { SpotifyService } from ".";

export class SpotifyArtistService {
  private readonly spotify: SpotifyService;

  private _bannedArtists: string[] = [];

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async init() {
    this._bannedArtists = await this.spotify.settings.getSetting(
      "bannedArtists"
    );
  }

  public isArtistBanned(uri: string): boolean {
    return this._bannedArtists.includes(uri);
  }

  public async banArtistByUri(uri: string) {
    this._bannedArtists.push(uri);
    await this.spotify.settings.saveSetting(
      "bannedArtists",
      this._bannedArtists
    );
  }

  public async banArtistByName(name: string) {
    const artist = (await this.spotify.searchAsync(name, "artist")).artists
      .items[0];
    await this.banArtistByUri(artist.uri);
  }
}
