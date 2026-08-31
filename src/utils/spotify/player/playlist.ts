import { getBiggestImageUrl } from "@utils/array";
import { decode } from "he";
import { logger } from "@oceanity/firebot-helpers/firebot";
import { SpotifyService } from "@utils/spotify";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import { trackSummaryFromDetails } from "./track";
import ResponseError from "@/models/responseError";

export class SpotifyPlaylistService {
  private readonly spotify: SpotifyService;

  private _playlist: SpotifyPlaylistDetails | null = null;
  private _summary: SpotifyPlaylistSummary | null = null;

  /**
   * Playlists Spotify refuses to serve us, so we stop asking. Since November
   * 2024 the Web API 404s on Spotify's own editorial and algorithmic playlists,
   * and that is never going to start working on a retry.
   */
  private readonly _unavailableUris = new Set<string>();

  public constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public async init() {
    this.spotify.player.state.on(
      "playlist-state-changed",
      (uri?: string | null) => {
        // Handle here, an EventEmitter won't await this for us
        this.updateByUriAsync(uri).catch((error) => {
          logger.error(
            `Error updating Spotify playlist: ${getErrorMessage(error)}`,
            error
          );
        });
      }
    );
  }

  /* Getters */
  public get raw(): SpotifyPlaylistDetails | null {
    return this._playlist;
  }

  public get summary(): SpotifyPlaylistSummary | null {
    return this._summary;
  }

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
    return this._playlist?.owner.external_urls.spotify ?? "";
  }

  public get length(): number {
    return this._playlist?.tracks.total ?? -1;
  }

  public async updateByUriAsync(playlistUri?: string | null): Promise<void> {
    if (!playlistUri || this._unavailableUris.has(playlistUri)) {
      this.update(null);
      return;
    }

    const playlist = await this.fetchByUriAsync(playlistUri);

    if (this._playlist && this._playlist.snapshot_id === playlist?.snapshot_id)
      return;

    this.update(playlist);
  }

  public async fetchByUriAsync(
    playlistUri?: string | null
  ): Promise<SpotifyPlaylistDetails | null> {
    if (!playlistUri) return null;

    const id = this.spotify.getIdFromUri(playlistUri);

    try {
      const response = await this.spotify.api.fetch<SpotifyPlaylistDetails>(
        `/playlists/${id}`
      );

      return response.data ?? null;
    } catch (error) {
      if (error instanceof ResponseError && error.data?.status === 404) {
        this.markUnavailable(playlistUri);
        return null;
      }

      throw error;
    }
  }

  /**
   * Records a playlist as one Spotify won't serve, so we only ever ask once.
   */
  private markUnavailable(playlistUri: string): void {
    if (this._unavailableUris.has(playlistUri)) return;

    this._unavailableUris.add(playlistUri);

    logger.warn(
      `Spotify returned 404 for playlist ${playlistUri}. Spotify no longer serves its own editorial and algorithmic playlists ` +
        `(Discover Weekly, Daily Mix, Release Radar, Made For You, etc.) through the Web API, so playlist details will be ` +
        `unavailable while this one is playing. No further requests will be made for it.`
    );
  }

  private update(playlist: SpotifyPlaylistDetails | null): void {
    try {
      if (this._playlist?.uri === playlist?.uri) return;

      this._playlist = playlist ?? null;
      this._summary = playlistSummaryFromDetails(playlist);

      this.spotify.events.trigger("playlist-changed", { playlist });
    } catch (error) {
      logger.error(this.update.name, getErrorMessage(error), error);
      throw error;
    }
  }
}

export function playlistSummaryFromDetails(
  playlist?: SpotifyPlaylistDetails | null
): SpotifyPlaylistSummary | null {
  if (!playlist) return null;

  const { id, name, description, images, owner, uri } = playlist;

  return Object.freeze({
    id,
    name: decode(name),
    description: decode(description),
    coverImageUrl: getBiggestImageUrl(images),
    owner,
    isPublic: playlist.public,
    tracks: playlist.tracks.items
      .map((entry) => trackSummaryFromDetails(entry.track))
      .filter((t) => t !== null) as SpotifyTrackSummary[],
    url: playlist.external_urls.spotify,
    uri,
    length: playlist.tracks.total,
  });
}
