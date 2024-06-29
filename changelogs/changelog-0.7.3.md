## What's Changed

**Changes**

- Find and Enqueue Track can now take a direct link to a track on Spotify, eg. https://open.spotify.com/track/4PTG3Z6ehGkBFwjybzWkR8?si=ac674684a1d3410c
  - Will automatically determine whether input is a link or search query, no need to check on Firebot's side
- Find and Enqueue Track now has Explicit filter to prevent tracks marked Explicit from being enqueued
- Deprecated Variables will only send one chat alert per use after Firebot is restarted
