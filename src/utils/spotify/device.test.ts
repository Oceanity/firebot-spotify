import { SpotifyDeviceService } from "@utils/spotify/device";

describe("SpotifyDeviceService", () => {
  let spotifyDevice: SpotifyDeviceService;

  const defaults = {
    isAvailable: false,
    id: "",
  };

  beforeEach(() => {
    spotifyDevice = new SpotifyDeviceService();
  });

  it("should have default getter values", () => {
    for (const [key, value] of Object.entries(defaults)) {
      expect(spotifyDevice[key as keyof SpotifyDeviceService]).toBe(value);
    }
  });

  it("should update device id", () => {
    spotifyDevice.updateId("1234");

    expect(spotifyDevice.isAvailable).toBe(true);
    expect(spotifyDevice.id).toBe("1234");
  });
});
