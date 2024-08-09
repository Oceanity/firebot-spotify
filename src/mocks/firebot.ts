import { jest } from "@jest/globals";

jest.mock("@oceanity/firebot-helpers/firebot", () => ({
  logger: {
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
  chatFeedAlert: jest.fn(),
  integrationManager: {
    getIntegrationById: jest.fn(() => null),
  },
}));
