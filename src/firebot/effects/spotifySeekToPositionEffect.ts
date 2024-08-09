import { spotify } from "@/main";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

type EffectParams = { seekPosition: number };

export const SpotifySeekToPositionEffect: Firebot.EffectType<EffectParams> = {
  definition: {
    id: "seek-to-position",
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
    <eos-container header="Seek Position" pad-top="true">
      <firebot-input
        model="effect.seekPosition"
        input-title="Seek position"
        placeholder-text="Enter position in miliseconds"
        menu-position="under" />
    </eos-container>
  `,

  // @ts-expect-error ts6133: Variables must be named consistently
  optionsController: ($scope: EffectScope<EffectParams>) => {},

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
