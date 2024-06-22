import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";
import { HttpServerManager } from "@crowbartools/firebot-custom-scripts-types/types/modules/http-server-manager";
import { getErrorMessage } from "./string";

export let logger: ScriptModules["logger"];
export let effectRunner: ScriptModules["effectRunner"];
export let effectManager: ScriptModules["effectManager"];
export let eventManager: ScriptModules["eventManager"];
export let httpServer: HttpServerManager;
export let variableManager: ScriptModules["replaceVariableManager"];
export let integrationManager: ScriptModules["integrationManager"];
export let jsonDb: unknown;
export let utils: ScriptModules["utils"];

export function initModules(scriptModules: ScriptModules) {
  logger = scriptModules.logger;
  effectRunner = scriptModules.effectRunner;
  effectManager = scriptModules.effectManager;
  eventManager = scriptModules.eventManager;
  variableManager = scriptModules.replaceVariableManager;
  integrationManager = scriptModules.integrationManager;
  jsonDb = scriptModules.JsonDb;
  utils = scriptModules.utils;
  httpServer = scriptModules.httpServer;
}

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
