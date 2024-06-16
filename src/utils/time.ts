import { logger } from "./firebot";

// Redeclaring because performance.now() is readonly in github environment, can't mock
export const now = (): number => performance.now();

export async function delay(ms: number, startTime?: number): Promise<void> {
  const offset = startTime ? now() - startTime : 0;

  if (offset > ms) {
    logger.warn(
      `Possible overload: method took ${offset - ms}ms longer than expected`
    );
    return;
  }

  return new Promise((resolve) => setTimeout(resolve, ms - offset));
}
