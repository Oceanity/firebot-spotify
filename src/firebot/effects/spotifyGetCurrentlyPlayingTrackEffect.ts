import { spotify } from "@/main";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { getErrorMessage } from "@/utils/errors";

export const spotifyGetCurrentlyPlayingEffect: Firebot.EffectType<{}> = {
  definition: {
    id: "oceanity-spotify:get-currently-playing-track",
    name: "Spotify: Get Now Playing",
    description:
      "Gets all details of the currently playing track on active Spotify device",
    icon: "fab fa-spotify",
    categories: ["integrations"],
    //@ts-expect-error ts2353
    outputs: [
      {
        label: "Now Playing",
        description:
          "Will be currently playing track details if Spotify is playing, null if not.",
        defaultName: "nowPlaying",
      },
      {
        label: "Error Message",
        description:
          "If getting currently playing track failed, will contain an error message.",
        defaultName: "error",
      },
    ],
  },

  optionsTemplate: ``,

  // @ts-expect-error ts6133: Variables must be named consistently
  optionsController: ($scope: any, backendCommunicator: any, $q: any) => {},

  optionsValidator: () => [],

  onTriggerEvent: async () => {
    try {
      const track = await spotify.player.getCurrentlyPlaying();

      return {
        success: true,
        outputs: {
          nowPlaying: track.item,
        },
      };
    } catch (error) {
      return {
        success: false,
        outputs: {
          nowPlaying: null,
          error: getErrorMessage(error),
        },
      };
    }
  },
};
