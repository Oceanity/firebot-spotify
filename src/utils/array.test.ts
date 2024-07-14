import { getBiggestImageUrl } from "@utils/array";

describe("Array Helpers", () => {
  //#region getBiggestImageUrl
  describe("getBiggestImageUrl", () => {
    it("returns url of image with highest width", () => {
      const images: SpotifyImage[] = [
        { url: "small.jpg", width: 100, height: 100 },
        { url: "large.jpg", width: 300, height: 300 },
        { url: "medium.jpg", width: 200, height: 200 },
      ];
      expect(getBiggestImageUrl(images)).toBe("large.jpg");
    });

    it("returns first url if multiple images with same width", () => {
      const images: SpotifyImage[] = [
        { url: "large-image-1.jpg", width: 300, height: 300 },
        { url: "small.jpg", width: 100, height: 100 },
        { url: "large-image-2.jpg", width: 300, height: 300 },
      ];
      expect(getBiggestImageUrl(images)).toBe("large-image-1.jpg");
    });

    it("returns empty string if no images", () => {
      const images: SpotifyImage[] = [];

      expect(getBiggestImageUrl(images)).toBe("");
    });
  });
  //#endregion
});
