import { ScriptModules } from "@crowbartools/firebot-custom-scripts-types";

export let logger: ScriptModules["logger"] = {
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
};

export function initLogger(newLogger: ScriptModules["logger"]) {
  logger = newLogger;
}

export let logError = (message: string, error: any) => {
  if (error instanceof Error) {
    logger.error(`${message}: ${error.message}`);
  } else {
    logger.error(`Unhandled Exception: ${message}`);
  }
};
