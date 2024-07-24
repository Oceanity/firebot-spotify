import { eventManager, logger } from "@utils/firebot";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";

export class SpotifyEventService {
  constructor() {}

  /**
   * Triggers a Spotify Firebot event.
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
      logger.error(getErrorMessage(error), error);
    }
  }
}
