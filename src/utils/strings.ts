export function msToFormattedString(ms: number, showHours: boolean): string {
  const normalizedSeconds = ~~(ms / 1000);
  const hours = ~~(normalizedSeconds / 3600);
  const minutes = ~~((normalizedSeconds / 60) % 60);
  const seconds = ~~(normalizedSeconds % 60);
  return `${showHours ? `${hours}:` : ""}${
    showHours && hours && minutes < 10 ? "0" : ""
  }${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}
