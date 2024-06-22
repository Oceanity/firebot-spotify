## What's Changed

**New Variables**

- spotifyTrack
  - Contains all data found in the existing separated spotifyTrack variables, ie spotifyTrackTitle is equal to spotifyTrack[title]
- rawSpotifyTrack
  - Contains unaltered JSON response from the Spotify API for currently playing track, see [Response Sample](https://developer.spotify.com/documentation/web-api/reference/get-track) for details
- spotifyPlaylist
  - Contains all data found in the existing separated spotifyPlaylist variables, ie spotifyPlaylistName is equal to spotifyPlaylist[name]
    - Can access tracks and fields of tracks (up to 100, this will be expanded in a future update) by calling `$spotifyPlaylist[tracks.<index>.<field>]`, ie `$spotifyPlaylist[tracks.0.title]` will return the title of the first song in the playlist
- rawSpotifyPlaylist
  - Contains unaltered JSON response from the Spotify API for currently playing playlist, see [Response Sample](https://developer.spotify.com/documentation/web-api/reference/get-playlist) for detail
- spotifyQueue
  - Is an array of the upcoming tracks (up to 20 due to limitations of Spotify's API) for the currently playing Spotify queue
    - Can access fields by calling `$spotifyQueue[<index>.<field>]`, ie `$spotifyQueue[0.title]` will return the title of the first song in the queue
- rawSpotifyQueue
  - Contains unaltered JSON response from the Spotify API for currently playing queue, see [Response Sample](https://developer.spotify.com/documentation/web-api/reference/get-queue) for details

**New Response Variables**

- Find and Enqueue Track
  - spotifyTrack
    - Equivalent to `$spotifyTrack` but with details about the found and enqueued track

**Changes**

- Deprecated all individual spotifyTrackField variables, these will be removed in a future update
- Deprecated all individual spotifyPlaylistField variables, these will be removed in a future update

**Fixes**

- Change Playback State less likely to throw 403 error when used in rapid succession
  - NOTE: It is recommended to use a sequential Effect Queue specifically for this Effect to ensure this will not happen
- Fixed Lyric Grabber version checker reading versions as "undefined -> undefined"
