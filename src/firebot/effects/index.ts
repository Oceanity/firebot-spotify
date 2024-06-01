import {
  SpotifyChangePlaybackStateEffect,
  SpotifyChangePlaybackStateOptions,
} from "./spotifyChangePlaybackStateEffect";
import { SpotifyChangePlaybackVolumeEffect } from "./spotifyChangePlaybackVolumeEffect";
import { SpotifyChangeRepeatStateEffect } from "./spotifyChangeRepeatStateEffect";
import { SpotifyFindAndEnqueueTrackEffect } from "./spotifyFindAndEnqueueTrackEffect";
import { SpotifySeekToPositionEffect } from "./spotifySeekToPositionEffect";
import { SpotifySkipTrackEffect } from "./spotifySkipTrackEffect";

export const AllSpotifyEffects = [
  SpotifyChangePlaybackStateEffect,
  SpotifyChangePlaybackVolumeEffect,
  SpotifyChangeRepeatStateEffect,
  SpotifyFindAndEnqueueTrackEffect,
  SpotifySeekToPositionEffect,
  SpotifySkipTrackEffect,
];
