import { SpotifyService } from "@utils/spotify";
import { jest } from "@jest/globals";
import { testSearchResponse, testUser } from "@/testData";
import SpotifyProfileService from "./user";

describe("SpotifyProfileService", () => {
  let spotify: SpotifyService;
  let user: SpotifyProfileService;

  beforeEach(() => {
    spotify = new SpotifyService();
    user = new SpotifyProfileService(spotify);

    jest
      .spyOn(spotify, "searchAsync")
      .mockReturnValue(Promise.resolve(testSearchResponse));

    jest.spyOn(spotify.api, "fetch").mockReturnValue(
      Promise.resolve({
        ok: true,
        status: 200,
        data: testUser,
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("fetches user profile on first call", async () => {
    const response = await user.getProfileAsync();

    expect(spotify.api.fetch).toHaveBeenCalledTimes(1);
    expect(response).toBe(testUser);
  });

  it("uses cached data on subsequent calls", async () => {
    const responses: SpotifyUserProfile[] = [];

    for (let i = 0; i < 10; i++) {
      responses.push(await user.getProfileAsync());
    }

    // Should only fetch again after an hour
    expect(spotify.api.fetch).toHaveBeenCalledTimes(1);

    for (const response of responses) {
      expect(response).toBe(testUser);
    }
  });

  it("fetches again when user profile expires", async () => {
    jest.spyOn(performance, "now").mockReturnValueOnce(-3660000); // Force expiry to pass

    const firstResponse = await user.getProfileAsync();
    expect(firstResponse).toBe(testUser);

    jest.spyOn(performance, "now").mockReturnValueOnce(0);

    const secondResponse = await user.getProfileAsync();
    expect(secondResponse).toBe(testUser);

    expect(spotify.api.fetch).toHaveBeenCalledTimes(2);
  });

  it("throws error if fetch fails", async () => {
    jest
      .spyOn(spotify.api, "fetch")
      .mockReturnValue(Promise.resolve({ ok: false, status: 500, data: null }));

    await expect(user.getProfileAsync()).rejects.toThrow();
  });

  it("returns true if user is premium", async () => {
    const premiumUser = { ...testUser, product: "premium" };

    jest
      .spyOn(spotify.api, "fetch")
      .mockReturnValue(
        Promise.resolve({ ok: true, status: 200, data: premiumUser })
      );

    const response = await user.isPremiumAsync();
    expect(response).toBe(true);
  });

  it("returns false if user not premium", async () => {
    const notPremiumUser = { ...testUser, product: "free" };

    jest
      .spyOn(spotify.api, "fetch")
      .mockReturnValue(
        Promise.resolve({ ok: true, status: 200, data: notPremiumUser })
      );

    const response = await user.isPremiumAsync();
    expect(response).toBe(false);
  });
});
