import { SpotifyCancelUserQueuesEffect } from "./spotifyCancelUserQueuesEffect";
import { SpotifyChangePlaybackStateEffect } from "./spotifyChangePlaybackStateEffect";
import { SpotifyChangePlaybackVolumeEffect } from "./spotifyChangePlaybackVolumeEffect";
import { SpotifyChangeRepeatStateEffect } from "./spotifyChangeRepeatStateEffect";
import { SpotifyFindAndEnqueueTrackEffect } from "./spotifyFindAndEnqueueTrackEffect";
import { SpotifySeekToPositionEffect } from "./spotifySeekToPositionEffect";
import { SpotifySkipTrackEffect } from "./spotifySkipTrackEffect";

export const AllSpotifyEffects = [
  SpotifyCancelUserQueuesEffect,
  SpotifyChangePlaybackStateEffect,
  SpotifyChangePlaybackVolumeEffect,
  SpotifyChangeRepeatStateEffect,
  SpotifyFindAndEnqueueTrackEffect,
  SpotifySeekToPositionEffect,
  SpotifySkipTrackEffect,
];
