import { spotify } from "@/main";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { getErrorMessage } from "@/utils/string";
import { chatFeedAlert } from "@/utils/firebot";

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
        <eos-container header="Repeat Mode" pad-top="true">
          <dropdown-select options="repeatStateOptions" selected="effect.repeatState"></dropdown-select>
          <p ng-show="outOfDate" style="font-size:12px;margin-top:6px;color:pink;"><b>WARNING:</b> Please resave this effect to update it to the new save format! It is currently using an outdated version and will break in the 1.0 release when the compatibility layer is removed.</p>
        </eos-container>
      `,

    optionsController: ($scope: EffectScope<EffectParams>) => {
      $scope.outOfDate = false;
      $scope.repeatStateOptions = Object.freeze({
        off: "Off",
        track: "Track",
        context: "All",
      });

      // Convert old repeatState to new format
      if (Array.isArray($scope.effect.repeatState)) {
        $scope.outOfDate = true;
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
          chatFeedAlert(
            "The `Spotify Premium: Change Repeat Mode` effect has had changes to how it saves data, please edit the command and save it to update it to the new format."
          );
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
