import { getBiggestImageUrl } from "@utils/array";
import { decode } from "he";
import { logger } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify";
import { getErrorMessage } from "@/utils/string";

export class SpotifyPlaylistService {
  private readonly spotify: SpotifyService;

  private _playlist: SpotifyPlaylistDetails | null = null;

  public constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async init() {
    this.spotify.player.state.on(
      "playlist-state-changed",
      async (uri?) => await this.updateByUriAsync(uri)
    );
  }

  /* Getters */
  public get isActive(): boolean {
    return !!this._playlist;
  }

  public get id(): string {
    return this._playlist?.id ?? "";
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
    return this._playlist?.owner.href ?? "";
  }

  public get length(): number {
    return this._playlist?.tracks.total ?? -1;
  }

  public async updateByUriAsync(playlistUri?: string | null): Promise<void> {
    const playlist = await this.fetchByUriAsync(playlistUri);

    this.update(playlist);
  }

  public async fetchByUriAsync(
    playlistUri?: string | null
  ): Promise<SpotifyPlaylistDetails | null> {
    if (!playlistUri) return null;

    const id = this.spotify.getIdFromUri(playlistUri);

    const response = await this.spotify.api.fetch<SpotifyPlaylistDetails>(
      `/playlists/${id}`
    );

    return response.data ?? null;
  }

  private update(playlist: SpotifyPlaylistDetails | null): void {
    try {
      if (this._playlist?.uri === playlist?.uri) return;

      this._playlist = playlist ?? null;

      this.spotify.events.trigger("playlist-changed", { playlist });
    } catch (error) {
      logger.error(this.update.name, getErrorMessage(error), error);
      throw error;
    }
  }
}
