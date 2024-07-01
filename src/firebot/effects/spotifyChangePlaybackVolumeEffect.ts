import { spotify } from "@/main";
import { getErrorMessage } from "@/utils/string";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

type EffectParams = { volume: string };

export const SpotifyChangePlaybackVolumeEffect: Firebot.EffectType<EffectParams> =
  {
    definition: {
      id: "change-playback-volume",
      name: "Spotify Premium: Change Playback Volume",
      description: "Changes playback volume of active Spotify device",
      icon: "fab fa-spotify",
      categories: ["integrations"],
      //@ts-expect-error ts2353
      outputs: [
        {
          label: "Volume was changed",
          description:
            "Will be true if the playback volume was changed successfully, false if not.",
          defaultName: "volumeChanged",
        },
        {
          label: "Error Message",
          description:
            "If the playback volume was not changed successfully, will contain an error message.",
          defaultName: "error",
        },
      ],
    },
    optionsTemplate: `
        <eos-container header="Playback Volume" pad-top="true">
          <firebot-input 
            input-title="Volume"
            model="effect.volume" 
            placeholder-text="Enter number between 0 - 100"
            style="border-radius:8px;overflow:hidden;" />
        </eos-container>
      `,

    // @ts-expect-error ts6133: Variables must be named consistently
    optionsController: ($scope: EffectScope<EffectParams>) => {},

    optionsValidator: (effect) => {
      const errors = [];
      if (!effect.volume) {
        errors.push("Volume field is required!");
      }
      return errors;
    },

    onTriggerEvent: async (event) => {
      try {
        const volumeInt = Number(event.effect.volume);

        if (isNaN(volumeInt)) {
          throw new Error("Volume must be a number!");
        }

        await spotify.player.setVolumeAsync(volumeInt);

        return {
          success: true,
          outputs: {
            volumeChanged: true,
            error: null,
          },
        };
      } catch (error) {
        return {
          success: false,
          outputs: {
            volumeChanged: false,
            error: getErrorMessage(error),
          },
        };
      }
    },
  };
