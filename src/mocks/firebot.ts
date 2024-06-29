import { chatFeedAlert } from "@/utils/firebot";
import { jest } from "@jest/globals";

jest.mock("@utils/firebot", () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  chatFeedAlert: jest.fn(),
}));
