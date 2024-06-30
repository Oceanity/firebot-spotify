import { spotify } from "@/main";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { getErrorMessage } from "@/utils/string";

export const SpotifyChangeRepeatStateEffect: Firebot.EffectType<{
  repeatState: [SpotifyRepeatState, string];
}> = {
  definition: {
    id: "change-repeat-state",
    name: "Spotify Premium: Change Repeat Mode",
    description: "Changes repeat mode of active Spotify device",
    icon: "fab fa-spotify",
    categories: ["integrations"],
    //@ts-expect-error ts2353
    outputs: [
      {
        label: "Repeat mode was changed",
        description:
          "Will be true if the repeat mode was changed successfully, false if not.",
        defaultName: "repeatModeChanged",
      },
      {
        label: "Error Message",
        description:
          "If the repeat mode was not changed successfully, will contain an error message.",
        defaultName: "error",
      },
    ],
  },

  optionsTemplate: `
    <eos-container header="Repeat Mode">
      <div class="btn-group">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span class="list-effect-type">{{effect.repeatState ? effect.repeatState[1] : 'Repeat Mode...'}}</span> <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li ng-click="effect.repeatState = ['off', 'Off']">
            <a href>Off</a>
          </li>
          <li ng-click="effect.repeatState = ['track', 'Track']">
            <a href>Track</a>
          </li>
          <li ng-click="effect.repeatState = ['context', 'All']">
            <a href>All</a>
          </li>
        </ul>
      </div>
    </eos-container>
  `,

  // @ts-expect-error ts6133: Variables must be named consistently
  optionsController: ($scope: any, backendCommunicator: any, $q: any) => {},

  optionsValidator: (effect) => {
    const errors: string[] = [];

    if (!effect.repeatState) {
      errors.push("Looping mode is required!");
    }

    return errors;
  },

  onTriggerEvent: async (event) => {
    try {
      const { repeatState } = event.effect;

      await spotify.player.setRepeatStateAsync(repeatState[0]);

      return {
        success: true,
        outputs: {
          repeatModeChanged: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        outputs: {
          repeatModeChanged: false,
          error: getErrorMessage(error),
        },
      };
    }
  },
};
