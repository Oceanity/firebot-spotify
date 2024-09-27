## What's Changed

**Fixes**
- `$spotifyUserQueues` will behave more consistently with other variables, and the requirement to pass a username before a path is removed, eg. you can now do `$spotifyUserQueues[0.title]` to get the title of the first song, no matter who queued it

**Changed Variables**
- `$spotifyUserQueues`
  - Any use of this with the selector `{index}.track.{key}` needs to be updated to `{index}.{key}`
  - Any use of `{index}.position` needs to be updated to `{index}.queuedPosition`
  - `queuedBy` and `skip` properties are unchanged