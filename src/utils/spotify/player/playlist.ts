import { getBiggestImageUrl } from "@utils/array";
import { decode } from "he";
import { logger } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify";

export default class SpotifyPlaylistService {
  private readonly spotify: SpotifyService;

  private _playlist: SpotifyPlaylistDetails | null = null;

  public constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async init() {
    this.spotify.player.state.on(
      "playlist-state-changed",
      this.playlistChangedHandler
    );
  }

  /* Getters */
  public get id(): string | null {
    return this._playlist?.id ?? null;
  }

  public get isPlaylistActive(): boolean {
    return !!this._playlist;
  }

  public get name(): string {
    return this._playlist ? decode(this._playlist.name) : "";
  }

  public get description(): string {
    return this._playlist ? decode(this._playlist.description) : "";
  }

  public get url(): string {
    return this._playlist?.external_urls.spotify ?? "";
  }

  public get uri(): string {
    return this._playlist?.uri ?? "";
  }

  public get coverImageUrl(): string {
    return getBiggestImageUrl(this._playlist?.images ?? []);
  }

  public get owner(): string {
    return this._playlist ? decode(this._playlist.owner.display_name) : "";
  }

  public get ownerUrl(): string {
    return this._playlist?.owner.external_urls.spotify ?? "";
  }

  public get length(): number {
    return this._playlist?.tracks.total ?? -1;
  }

  private async playlistChangedHandler(uri: string) {
    await this.updateCurrentPlaylistAsync(uri);

    this.spotify.events.trigger("playlist-changed", { uri });
  }

  private async updateCurrentPlaylistAsync(playlistUri: string | null) {
    try {
      if (!playlistUri) {
        this._playlist = null;
        return;
      }

      const id = this.spotify.getIdFromUri(playlistUri);

      if (this._playlist && this._playlist.id === id) {
        return;
      }

      const response = await this.spotify.api.fetch<SpotifyPlaylistDetails>(
        `/playlists/${id}`
      );

      if (!response.data) {
        this._playlist === null;
        throw new Error("No Spotify playlist found with provided Id");
      }

      this._playlist = response.data;

      this.spotify.events.trigger("playlist-changed", {});
    } catch (error) {
      logger.error("Error getting Spotify Queue", error);
      throw error;
    }
  }
}
