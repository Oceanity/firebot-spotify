import { getBiggestImageUrl } from "@utils/array";
import { decode } from "he";
import { eventManager, logger } from "@utils/firebot";
import { SpotifyService } from "@utils/spotify";

export default class SpotifyPlaylistService {
  private readonly spotify: SpotifyService;

  private _playlist: SpotifyPlaylistDetails | null = null;

  public constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
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

  public async updateCurrentPlaylistAsync(playlistUri: string | null) {
    try {
      if (!playlistUri) {
        this._playlist = null;
        return;
      }

      const id = this.getIdFromUri(playlistUri);

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

      eventManager.triggerEvent("oceanity-spotify", "playlist-changed", {});
    } catch (error) {
      logger.error("Error getting Spotify Queue", error);
      throw error;
    }
  }

  private getIdFromUri = (uri: string): string => uri.split(":")[2];
}
