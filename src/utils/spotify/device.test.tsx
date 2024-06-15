import { SpotifyDeviceService } from "@/utils/spotify/device";

describe("SpotifyDeviceService", () => {
  let spotifyDevice: SpotifyDeviceService;

  beforeEach(() => {
    spotifyDevice = new SpotifyDeviceService();
  });

  it("should not have initial values", () => {
    expect(spotifyDevice.isAvailable).toBe(false);
    expect(spotifyDevice.id).toBe("");
  });

  it("should update device id", () => {
    spotifyDevice.updateId("1234");

    expect(spotifyDevice.isAvailable).toBe(true);
    expect(spotifyDevice.id).toBe("1234");
  });
});
