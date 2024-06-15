export const getBiggestImageUrl = (images: SpotifyImage[]) =>
  images.length ? images.reduce((a, b) => (b.width > a.width ? b : a)).url : "";
