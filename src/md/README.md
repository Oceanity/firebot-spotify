# Spotify Integration by Oceanity <sub style="color:gray">$PROJECT_VERSION</sub>

This is a Firebot Script that will allow you to integrate Spotify functionality and information into your Firebot setup. Due to very stict limits on Spotify's API, it does require that you make your own application in Spotify's developer portal and supply your own Client ID and Secret.

1. [Setup](#Setup)
2. [Features](#Features)

<div id="Setup" />

### Setup

- Log in to your Spotify Account on https://developer.spotify.com/ and click "Create app"
  - App name and description can be whatever you want
  - Website is optional, also doesn't matter what you use here
  - Callback Url must be `http://127.0.0.1:7472/api/v1/auth/callback`
  - API/SDKs to use are Web API and Web Playback API
  - Click checkbox to agree with Spotify's TOS and Design Guidelines
- Take note of the Client ID and Client Secret, these are required to use this script
- In Firebot, go to Settings > Scripts
  - Enable Custom Scripts if they are not currently enabled
  - Click Manage Startup Scripts
  - Click Add New Script
  - Click the "scripts folder" link to open the Scripts Folder and place `oceanitySpotifyIntegration.js` there
  - Refresh the list of scripts and pick `oceanitySpotifyIntegration.js` from the dropdown
  - In Client Id and Client Secret fields, copy in the two codes from earlier
- Go to Settings > Integrations and click Link next to Spotify (by Oceanity)
  - Log in and authorize on the page that pops up
- You should now have the ability to use this script's Effects, Events and Replace Variables in Firebot

### Updating

- Overwrite existing `oceanitySpotifyIntegration.js` with new version
- Restart Firebot

### Lyrics Setup

- Install Tampermonkey from https://www.tampermonkey.net/
  - Google Chrome and other Chromium browsers may need to follow instructions here https://www.tampermonkey.net/faq.php#Q209 for this script to work
- Click the lyricsGrabber.user.js file included with the latest Release
- Tampermonkey should prompt you to install the script, click Install
- Visit https://open.spotify.com/lyrics and you should see a modal on the site for the plugin
- As long as the lyrics pane is open, any songs with Lyrics will now forward those to Firebot (they will not render in the browser, this is normal)

<div id="Features" />

### Features

This script adds the following features to Firebot

**Spotify Premium Required**

- Effects
  - Change Playback State
  - Change Repeat Mode
  - Change Volume
  - Find and Enqueue Track
  - Seek to Position
  - Skip Track

**Any Spotify Account**

- Replace Variables
  - Lyrics
    - spotifyLyricsCurrentLine: `string`
    - spotifyTrackHasLyrics: `bool`
  - Player
    - spotifyIsPlaying: `bool`
    - spotifyPlayerRelativeVolume: `float`
    - spotifyPlayerVolume: `integer`
  - Playlist
    - rawSpotifyPlaylist: `object`
      - See [Response Sample](https://developer.spotify.com/documentation/web-api/reference/get-playlist) for details
    - spotifyIsPlaylistActive: `bool`
    - spotifyPlaylist: `object`
      - spotifyPlaylist[id]: `string`
      - spotifyPlaylist[name]: `string`
      - spotifyPlaylist[description]: `string`
      - spotifyPlaylist[length]: `integer`
      - spotifyPlaylist[coverImageUrl]: `string`
      - spotifyPlaylist[owner]: `string`
      - spotifyPlaylist[ownerUrl]: `string`
      - ## spotifyPlaylist[tracks]: `array`
      - spotifyPlaylist[url]: `string`
      - spotifyPlaylist[uri]: `string`
  - Track
    - rawSpotifyTrack: `object`
      - See [Response Sample](https://developer.spotify.com/documentation/web-api/reference/get-track) for details
    - spotifyTrack: `object`
      - spotifyTrack[id]: `string`
      - spotifyTrack[title]: `string`
      - spotifyTrack[artist]: `string`
      - spotifyTrack[artists]: `string[]`
      - spotifyTrack[album]: `string`
      - spotifyTrack[albumArtUrl]: `string`
      - spotifyTrack[duration]: `string`
      - spotifyTrack[durationMs]: `integer`
      - spotifyTrack[position]: `string`
      - spotifyTrack[positionMs]: `integer`
      - spotifyTrack[relativePosition]: `float`
      - spotifyTrack[url]: `string`
      - spotifyTrack[uri]: `string`
  - Queue
    - rawSpotifyQueue: `object`
      - See [Response Sample](https://developer.spotify.com/documentation/web-api/reference/get-queue) for details
    - spotifyQueue: `object`
      - spotifyQueue[0..20]: `object` (same structure as spotifyTrack var)
        - spotifyQueue[0.title]: `string`
        - spotifyQueue[0.artist]: `string`
        - etc.
    - spotifyUserQueues: `object`
      - spotifyQueue[0..inf]: `object`
        - spotifyQueue[0.queuedBy]: `string`
        - spotifyQueue[0.position]: `number`
        - spotifyQueue[0.track]: `object` (same structure as spotifyTrack var)
- Events
  - Lyrics Changed
  - Playback State Changed
  - Playlist Changed
  - Tick
  - Track Changed
  - Track Auto-Skipped
  - Volume Changed
