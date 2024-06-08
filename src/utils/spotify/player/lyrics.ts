import { logger } from "@/utils/firebot";
import { SpotifyService } from "@utils/spotify";

export class SpotifyLyricsService {
  private readonly spotify: SpotifyService;

  public constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public init() {
    this.spotify.player.on("track-changed", (track) => {
      logger.info("Track changed", track);
    });
  }
}
