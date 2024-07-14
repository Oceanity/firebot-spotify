export function formatMsToTimecode(
  ms: number,
  showHours: boolean = false
): string {
  if (ms === -1) return showHours ? "0:00:00" : "0:00";
  const normalizedSeconds = ~~(ms / 1000);
  const hours = ~~(normalizedSeconds / 3600);
  const minutes = ~~((normalizedSeconds / 60) % 60);
  const seconds = ~~(normalizedSeconds % 60);
  return `${hours || showHours ? `${hours}:` : ""}${
    (hours || showHours) && minutes < 10 ? "0" : ""
  }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === "object" && error !== null) {
    return "Unhandled Exception";
  }
  return String(error);
};

export const getTriggerSource = (trigger: Trigger): string => {
  //logger.info(JSON.stringify(trigger));
  const { metadata, type } = trigger;
  switch (type) {
    case "command":
      return `Command: ${metadata.userCommand?.trigger}`;
    case "custom_script":
      return `Custom Script: ${metadata.userCommand?.trigger}`;
    case "startup_script":
      return `Startup Script: ${metadata.userCommand?.trigger}`;
    case "api":
      return `API: ${metadata.userCommand?.trigger}`;
    case "event":
      return `Event: ${metadata.event?.name}`;
    case "hotkey":
      return `Hotkey: ${metadata.hotkey}`;
    case "timer":
      return `Timer: ${metadata.userCommand?.trigger}`;
    case "counter":
      return `Counter: ${metadata.counter?.name}`;
    case "preset":
      return `Preset: ${metadata.userCommand?.trigger}`;
    case "quick_action":
      return `Quick Action: ${metadata.userCommand?.trigger}`;
    case "manual":
      return `Manual: ${metadata.userCommand?.trigger}`;
    default:
      return "Unknown Trigger Type";
  }
};

export const cleanUsername = (username?: string): string =>
  username ? username.trim().replace(/^@/, "").toLowerCase() : "";
