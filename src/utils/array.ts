export const getBiggestImageUrl = (images: SpotifyImage[]) =>
  images.length ? images.reduce((a, b) => (a.width > b.width ? a : b)).url : "";
