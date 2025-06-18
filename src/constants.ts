import { EventSource } from "@crowbartools/firebot-custom-scripts-types/types/modules/event-manager";
import * as packageJson from "../package.json";

//#region Integration constants

export const {
  name: SPOTIFY_INTEGRATION_ID,
  displayName: SPOTIFY_INTEGRATION_NAME,
  description: SPOTIFY_INTEGRATION_DESCRIPTION,
  author: SPOTIFY_INTEGRATION_AUTHOR,
  version: SPOTIFY_INTEGRATION_VERSION,
} = packageJson;

export const SPOTIFY_INTEGRATION_FIREBOT_VERSION = "5";

export const SPOTIFY_EVENT_SOURCE: EventSource = {
  id: SPOTIFY_INTEGRATION_ID,
  name: SPOTIFY_INTEGRATION_NAME,
  events: [],
};

//#endregion

//#region Spotify API constants

export const SPOTIFY_API_URL = "https://api.spotify.com/v1";

export const SPOTIFY_SCOPES = [
  "app-remote-control",
  "streaming",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-read-email",
  "user-read-playback-position",
  "user-read-playback-state",
  "user-read-private",
  "user-read-recently-played",
];

//#endregion
