import { IntegrationId } from "@/spotifyIntegration";
import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";

export let logger: ScriptModules["logger"];
export let effectRunner: ScriptModules["effectRunner"];
export let effectManager: ScriptModules["effectManager"];
export let integrationManager: ScriptModules["integrationManager"];
export let jsonDb: ScriptModules["JsonDb"];
export let utils: ScriptModules["utils"];

export function initModules(scriptModules: ScriptModules) {
  logger = scriptModules.logger;
  effectRunner = scriptModules.effectRunner;
  effectManager = scriptModules.effectManager;
  integrationManager = scriptModules.integrationManager;
  jsonDb = scriptModules.JsonDb;
  utils = scriptModules.utils;
}

export function chatFeedAlert(message: string) {
  effectRunner.processEffects({
    trigger: {
      type: "custom_script",
      metadata: {
        username: "script",
      },
    },
    effects: {
      id: `${IntegrationId}-${Date.now()}`,
      list: [
        {
          id: "e6bac140-1894-11ef-a992-091f0a9405f6",
          type: "firebot:chat-feed-alert",
          active: true,
          message,
        },
      ],
    },
  });
}
