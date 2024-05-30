import Spotify from "@utils/spotify";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { IntegrationId } from "@/spotifyIntegration";

export const spotifyChangePlaybackVolumeEffect: Firebot.EffectType<{
  volume: number;
}> = {
  definition: {
    id: `${IntegrationId}:change-playback-volume`,
    name: "Spotify Premium: Change Playback Volume",
    description: "Changes playback volume of active Spotify Device",
    icon: "fab fa-spotify",
    categories: ["integrations"],
    //@ts-expect-error ts2353
    outputs: [
      {
        label: "Volume was changed",
        description:
          "Returns true if the playback volume was changed successfully, otherwise false.",
        defaultName: "volumeChanged",
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
    if (effect.volume % 1 !== 0) {
      errors.push("Volume must be an integer!");
    }
    if (effect.volume < 0 || effect.volume > 100) {
      errors.push("Volume must be between 0 and 100!");
    }
    return errors;
  },

  onTriggerEvent: async (event) => {
    const { volume } = event.effect;

    const volumeChanged = await Spotify.changePlaybackVolumeAsync(volume);

    return {
      success: true,
      outputs: {
        volumeChanged,
      },
    };
  },
};
