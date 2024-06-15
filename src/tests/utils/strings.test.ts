import { msToFormattedString } from "@utils/strings";

describe("msToFormattedString", () => {
  beforeEach(() => {});

  it("returns expected string value for small number", () => {
    expect(msToFormattedString(1000, false)).toBe("0:01");
  });

  it("returns expected string with floored ms", () => {
    expect(msToFormattedString(956, false)).toBe("0:00");
    expect(msToFormattedString(1240, false)).toBe("0:01");
  });

  it("includes hours in string value when enabled", () => {
    expect(msToFormattedString(60000, true)).toBe("0:01:00");
  });

  it("returns expected string value for large number", () => {
    expect(msToFormattedString(3600000, false)).toBe("1:00:00");
  });

  it("returns expected string value for silly number", () => {
    expect(msToFormattedString(817000, false)).toBe("13:37");
  });
});
