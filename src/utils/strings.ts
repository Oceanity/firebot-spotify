export function formatMsToTimecode(ms: number, showHours: boolean): string {
  const normalizedSeconds = ~~(ms / 1000);
  const hours = ~~(normalizedSeconds / 3600);
  const minutes = ~~((normalizedSeconds / 60) % 60);
  const seconds = ~~(normalizedSeconds % 60);
  return `${hours || showHours ? `${hours}:` : ""}${
    (hours || showHours) && minutes < 10 ? "0" : ""
  }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

export const getErrorMessage = (error: any): string =>
  error instanceof Error ? error.message : "Unhandled Exception";
