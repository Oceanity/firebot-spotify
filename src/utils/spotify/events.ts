import { SpotifyService } from "@utils/spotify";
import { eventManager, logger } from "../firebot";

export class SpotifyEventService {
  private readonly spotify: SpotifyService;

  constructor(spotifyService: SpotifyService) {
    this.spotify = spotifyService;
  }

  /**
   * Triggers a spotify event.
   *
   * @param {string} eventId - The id of the event to trigger.
   * @param {Record<string, unknown>} meta - The metadata associated with the event.
   * @param {boolean} [isManual=false] - Whether the event was triggered manually.
   * @throws {Error} If there was an error triggering the event.
   */
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
