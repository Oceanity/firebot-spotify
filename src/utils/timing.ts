import { logger } from "./firebot";

export async function delay(ms: number, methodStart?: number): Promise<void> {
  const offset = methodStart ? Date.now() - methodStart : 0;

  if (offset > ms) {
    logger.info(
      `Possible overload: method took ${offset - ms}ms longer than expected`
    );
  }

  return new Promise((resolve) => setTimeout(resolve, ms - offset));
}
