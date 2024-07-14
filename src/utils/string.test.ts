import ResponseError from "@/models/responseError";
import {
  getErrorMessage,
  formatMsToTimecode,
  getTriggerSource,
  cleanUsername,
} from "@/utils/string";

describe("String Helpers", () => {
  //#region msToFormattedString
  describe("msToFormattedString", () => {
    it("returns expected string value for small number", () => {
      expect(formatMsToTimecode(1000)).toBe("0:01");
    });

    it("returns expected string with floored ms", () => {
      expect(formatMsToTimecode(956)).toBe("0:00");
      expect(formatMsToTimecode(1240)).toBe("0:01");
    });

    it("includes hours in string value when enabled", () => {
      expect(formatMsToTimecode(60000, true)).toBe("0:01:00");
    });

    it("returns expected string value for large number", () => {
      expect(formatMsToTimecode(3600000)).toBe("1:00:00");
    });

    it("returns expected string value for silly number", () => {
      expect(formatMsToTimecode(817000)).toBe("13:37");
    });

    it("returns 0:00 if ms is -1", () => {
      expect(formatMsToTimecode(-1)).toBe("0:00");
    });

    it("returns 0:00:00 if ms is -1 and showHours is true", () => {
      expect(formatMsToTimecode(-1, true)).toBe("0:00:00");
    });
  });
  //#endregion

  //#region getErrorMessage
  const errorMessage = "some fancy error message";

  describe("getErrorMessage", () => {
    it("returns error message for Error", () => {
      expect(getErrorMessage(new Error(errorMessage))).toBe(errorMessage);
    });

    it("returns error message for ResponseError", () => {
      expect(
        getErrorMessage(new ResponseError(errorMessage, { foo: "bar" }))
      ).toBe(errorMessage);
    });

    it("returns expected string value for string", () => {
      expect(getErrorMessage(errorMessage)).toBe(errorMessage);
    });

    it("returns expected string value for number", () => {
      expect(getErrorMessage(123)).toBe("123");
    });

    it("retuns expected string value for boolean", () => {
      expect(getErrorMessage(true)).toBe("true");
    });

    it("returns `Unhandled Exception` when no message found", () => {
      expect(getErrorMessage({ someData: "test" })).toBe("Unhandled Exception");
    });
  });
  //#endregion

  describe("getTriggerSource", () => {
    let trigger: Trigger;

    beforeEach(() => {
      trigger = {
        type: "manual",
        metadata: {
          userCommand: {
            trigger: "test",
            args: [],
          },
          username: "test",
        },
      };
    });

    it("returns expected string value for user command", () => {
      let triggerName = "!test";

      trigger.type = "command";
      trigger.metadata.userCommand = {
        trigger: triggerName,
        args: [],
      };

      expect(getTriggerSource(trigger)).toContain(triggerName);
    });
  });

  describe("cleanUsername", () => {
    it("returns expected string value with already cleaned username", () => {
      expect(cleanUsername("test")).toBe("test");
    });

    it("returns expected string value with @ symbol", () => {
      expect(cleanUsername("@test")).toBe("test");
    });

    it("returns expected string with various cased name", () => {
      expect(cleanUsername("tEsT")).toBe("test");
    });

    it("returns empty string if username is undefined", () => {
      expect(cleanUsername(undefined)).toBe("");
    });
  });
});
