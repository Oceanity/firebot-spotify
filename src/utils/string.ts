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
