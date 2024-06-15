import { delay } from "@utils/timing";

describe("delay", () => {
  it("resolves after ms", async () => {
    const startTime = performance.now();
    await delay(100);
    expect(performance.now() - startTime).toBeGreaterThanOrEqual(100);
  });
});
