import { logger } from "./firebot";

export async function delay(ms: number, startTime?: number): Promise<void> {
  const offset = startTime ? performance.now() - startTime : 0;

  if (offset > ms) {
    logger.warn(
      `Possible overload: method took ${offset - ms}ms longer than expected`
    );
    return;
  }

  return new Promise((resolve) => setTimeout(resolve, ms - offset));
}
