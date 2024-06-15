import { spotify } from "@/main";
import { getErrorMessage } from "@utils/strings";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

export const SpotifySeekToPositionEffect: Firebot.EffectType<{
  seekPosition: number;
}> = {
  definition: {
    id: "oceanity-spotify:seek-to-position",
    name: "Spotify Premium: Seek To Position",
    description: "Seeks to position in track",
    icon: "fab fa-spotify",
    categories: ["integrations"],
    //@ts-expect-error ts2353
    outputs: [
      {
        label: "Seek was successful",
        description: "Will be true if the seek was successful, false if not.",
        defaultName: "seekSuccessful",
      },
      {
        label: "Error Message",
        description:
          "If the seek was not successful, will contain an error message.",
        defaultName: "error",
      },
    ],
  },

  optionsTemplate: `
    <eos-container header="Seek Position (ms)" pad-top="true">
      <p class="muted">Seek Position (ms)</p>
      <input ng-model="effect.seekPosition" type="text" class="form-control" id="chat-text-setting" placeholder="Seek position (ms)" menu-position="under" replace-variables/>
    </eos-container>
  `,

  // @ts-expect-error ts6133: Variables must be named consistently
  optionsController: ($scope: any, backendCommunicator: any, $q: any) => {},

  optionsValidator: (effect) => {
    const errors = [];
    if (!effect.seekPosition) {
      errors.push("Seek position field is required!");
    }
    return errors;
  },

  onTriggerEvent: async (event) => {
    const { seekPosition } = event.effect;

    try {
      await spotify.player.seekToPositionAsync(seekPosition);

      return {
        success: true,
        outputs: {
          seekSuccessful: true,
          error: null,
        },
      };
    } catch (error) {
      return {
        success: false,
        outputs: {
          seekSuccessful: false,
          error: getErrorMessage(error),
        },
      };
    }
  },
};
