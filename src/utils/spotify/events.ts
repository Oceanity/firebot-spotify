import { SpotifyService } from "@utils/spotify";
import { eventManager, logger } from "../firebot";

export class SpotifyEventService {
  private readonly spotify: SpotifyService;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  public trigger(
    eventId: string,
    meta: Record<string, unknown>,
    isManual = false
  ) {
    try {
      eventManager.triggerEvent("oceanity-spotify", eventId, meta, isManual);
    } catch (error) {
      let message =
        error instanceof Error ? error.message : "Unhandled Exception";
      logger.error(message, error);
    }
  }
}
