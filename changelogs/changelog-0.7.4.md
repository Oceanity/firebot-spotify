## What's Changed

**Fixes**

- Fixed bug introduced by a change in Spotify's API that would cause all effects to act as if they were failing

**New Effect**

- Cancel User Request
  - Cancels either the last or all requests by the provided user
  - Requires new "Queued by" to be filled in "Find and Enqueue Track" Effect

**New Event**

- Spotify Track Auto-Skipped
  - Will fire when track was auto-skipped, will not also fire Track Changed

**New Variable**

- spotifyUserQueues
  - Array of details of user-added tracks to the queue, will not show playlist tracks of manually added tracks like spotifyQueue, but does include who queued the track and what position it is in
