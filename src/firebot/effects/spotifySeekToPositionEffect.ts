import { spotify } from "@/main";
import { getErrorMessage } from "@utils/errors";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

export const spotifySeekToPositionEffect: Firebot.EffectType<{
  volume: number;
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
      <p class="muted">Playback Volume (must be integer between 0-100)</p>
      <input ng-model="effect.volume" type="text" class="form-control" id="chat-text-setting" placeholder="Volume" menu-position="under" replace-variables/>
    </eos-container>
    <eos-container header="Playback State">
      <div class="btn-group">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span class="list-effect-type">{{effect.playState ? effect.playState : 'Play'}}</span> <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li ng-click="effect.playState = 'Play'">
            <a href>Play</a>
          </li>
          <li ng-click="effect.playState = 'Pause'">
            <a href>Pause</a>
          </li>
          <li ng-click="effect.playState = 'Toggle'">
            <a href>Toggle</a>
          </li>
        </ul>
      </div>
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
