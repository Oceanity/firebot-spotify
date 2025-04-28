import { spotify } from "@/main";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { getErrorMessage } from "@oceanity/firebot-helpers/string";

type EffectParams = {
  repeatState: SpotifyRepeatState;
};

export const SpotifyChangeRepeatStateEffect: Firebot.EffectType<EffectParams> =
  {
    definition: {
      id: "change-repeat-state",
      name: "Spotify Premium: Change Repeat Mode",
      description: "Changes repeat mode of active Spotify device",
      icon: "fab fa-spotify",
      categories: ["integrations"],
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
        <eos-container header="Repeat Mode" pad-top="true">
          <dropdown-select options="repeatStateOptions" selected="effect.repeatState"></dropdown-select>
        </eos-container>
      `,

    optionsController: ($scope: EffectScope<EffectParams>) => {
      $scope.repeatStateOptions = Object.freeze({
        off: "Off",
        track: "Track",
        context: "All",
      });

      // Convert old repeatState to new format
      if (Array.isArray($scope.effect.repeatState)) {
        $scope.effect.repeatState = $scope.effect.repeatState[0];
      }
    },

    optionsValidator: (effect) => {
      const errors: string[] = [];

      if (!effect.repeatState) {
        errors.push("Looping mode is required!");
      }

      return errors;
    },

    onTriggerEvent: async (event) => {
      try {
        let repeatState = event.effect.repeatState;

        if (Array.isArray(repeatState)) {
          repeatState = repeatState[0];
        }

        await spotify.player.setRepeatStateAsync(repeatState);

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
