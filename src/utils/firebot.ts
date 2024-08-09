import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import { effectManager, logger } from "@oceanity/firebot-helpers/firebot";


export async function chatFeedAlert(message: string) {
  try {
    //@ts-expect-error ts2339
    const effect = effectManager.getEffectById("firebot:chat-feed-alert");
    if (!effect || !effect.onTriggerEvent) {
      throw new Error("Unable to trigger chat feed alert");
    }
    await effect.onTriggerEvent({
      effect: {
        message,
      },
      trigger: {
        type: "custom_script",
        metadata: {
          username: "script",
        },
      },
    });
  } catch (error) {
    logger.error(getErrorMessage(error), error);
    throw error;
  }
}
