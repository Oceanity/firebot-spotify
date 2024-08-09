## What's Changed

**Fixes**
- Plugin will no longer Chat Feed Alert on errors
- No more errors when Non-Premium user uses plugin due to Queue pulls

**Removed Variables**
- $spotifyTrackTitle
- $spotifyTrackArtist
- $spotifyTrackArtists
  - you were warned :P
  - more variables have been marked for deletion, if you see warnings in chat feed alerts, you should fix them 

**Removed Events**
- Queue Changed
  - Honestly very unfortunate this needs to be regressed, but, blame Spotify having a weird Premium-only limitation on Get Spotify Queue in their API /shrug

**Changed Variables**
- $spotifyQueue
- $rawSpotifyQueue
  - Due to the fact these need premium, they now pull every time they use the variable with auth, so I'd advise folks to save these to a custom variable and pull data from that to avoid rate limits

**Behind the Scenes**
- Moved some helper functions to a new shared library, `@oceanity/firebot-helpers`, this shouldn't have any functional effect on the plugin but means I can be lazier in my others