import { spotify } from "@/main";
import { getErrorMessage } from "@utils/errors";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

export const SpotifyChangePlaybackVolumeEffect: Firebot.EffectType<{
  volume: number;
}> = {
  definition: {
    id: "oceanity-spotify:change-playback-volume",
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
      <p class="muted">Playback Volume (must be integer between 0-100)</p>
      <input ng-model="effect.volume" type="text" class="form-control" id="chat-text-setting" placeholder="Volume" menu-position="under" replace-variables/>
    </eos-container>
  `,

  // @ts-expect-error ts6133: Variables must be named consistently
  optionsController: ($scope: any, backendCommunicator: any, $q: any) => {},

  optionsValidator: (effect) => {
    const errors = [];
    if (!effect.volume) {
      errors.push("Volume field is required!");
    }
    return errors;
  },

  onTriggerEvent: async (event) => {
    const { volume } = event.effect;

    try {
      await spotify.player.setVolumeAsync(volume);

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
