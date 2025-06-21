export type SpotifyIntegrationSettings = {
  authentication: {
    clientId: string;
    clientSecret: string;
    callbackHostname: string;
  };
};

export enum SpotifyEvent {
  LyricsChanged = "lyrics-changed",
  PlaybackStateChanged = "playback-state-changed",
  PlaylistChanged = "playlist-changed",
  Tick = "tick",
  TrackChanged = "track-changed",
  TrackAutoSkipped = "track-auto-skipped",
  VolumeChanged = "volume-changed",
}
