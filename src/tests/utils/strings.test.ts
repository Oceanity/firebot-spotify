import { getErrorMessage, formatMsToTimecode } from "@utils/strings";

//#region msToFormattedString
describe("msToFormattedString", () => {
  beforeEach(() => {});

  it("returns expected string value for small number", () => {
    expect(formatMsToTimecode(1000, false)).toBe("0:01");
  });

  it("returns expected string with floored ms", () => {
    expect(formatMsToTimecode(956, false)).toBe("0:00");
    expect(formatMsToTimecode(1240, false)).toBe("0:01");
  });

  it("includes hours in string value when enabled", () => {
    expect(formatMsToTimecode(60000, true)).toBe("0:01:00");
  });

  it("returns expected string value for large number", () => {
    expect(formatMsToTimecode(3600000, false)).toBe("1:00:00");
  });

  it("returns expected string value for silly number", () => {
    expect(formatMsToTimecode(817000, false)).toBe("13:37");
  });
});
//#endregion

//#region getErrorMessage
describe("getErrorMessage", () => {
  it("returns expected string value", () => {
    expect(getErrorMessage(new Error("test"))).toBe("test");
  });

  it("returns `Unhandled Exception` when no message found", () => {
    expect(getErrorMessage({})).toBe("Unhandled Exception");
  });
});
//#endregion
