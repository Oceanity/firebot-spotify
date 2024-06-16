import { delay, now } from "@utils/time";
import { logger } from "@utils/firebot";
import { jest } from "@jest/globals";

jest.mock("@utils/firebot", () => ({
  logger: {
    warn: jest.fn(),
  },
}));

describe("delay", () => {
  it("resolves after ms", async () => {
    const startTime = now();
    await delay(100);
    expect(now() - startTime).toBeGreaterThanOrEqual(100);
  });

  it("logs warning if method took longer than expected", async () => {
    const startTime = now() - 5000;

    await delay(1000, startTime);

    // Check if logger.warn was called
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining("Possible overload: method took")
    );
  });
});
