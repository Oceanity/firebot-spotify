import { getBiggestImageUrl } from "@utils/array";

//#region getBiggestImageUrl
describe("getBiggestImageUrl", () => {
  it("should return url of image with highest width", () => {
    const images: SpotifyImage[] = [
      { url: "small.jpg", width: 100, height: 100 },
      { url: "medium.jpg", width: 200, height: 200 },
      { url: "large.jpg", width: 300, height: 300 },
    ];
    expect(getBiggestImageUrl(images)).toBe("large.jpg");
  });

  it("should return empty string if no images", () => {
    expect(getBiggestImageUrl([])).toBe("");
  });
});
//#endregion
