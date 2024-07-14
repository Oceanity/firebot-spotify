import { spotify } from "@/main";
import { getErrorMessage } from "@/utils/string";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

export enum SpotifySkipTarget {
  Previous = "Previous",
  Next = "Next",
}

type EffectParams = { target: string };

export const SpotifySkipTrackEffect: Firebot.EffectType<EffectParams> = {
  definition: {
    id: "skip-track",
    name: "Spotify Premium: Skip Track",
    description: "Skip current track on active Spotify device",
    icon: "fab fa-spotify",
    categories: ["integrations"],
    //@ts-expect-error ts2353
    outputs: [
      {
        label: "Track was skipped",
        description:
          "Will be true if the track was skipped successfully, false if not.",
        defaultName: "trackWasSkipped",
      },
    ],
  },

  optionsTemplate: `
      <eos-container header="Skip Direction" pad-top="true">
        <dropdown-select options="targetOptions" selected="effect.target"></dropdown-select>
      </eos-container>
    `,

  optionsController: ($scope: EffectScope<EffectParams>) => {
    $scope.targetOptions = ["Next", "Previous"];
  },

  optionsValidator: (effect) => {
    var errors = [];
    if (!effect.target) {
      errors.push("Skip Direction is required");
    }
    return errors;
  },

  onTriggerEvent: async (event) => {
    const { target } = event.effect;
    try {
      switch (target) {
        case SpotifySkipTarget.Previous:
          await spotify.player.previousAsync();
          break;
        case SpotifySkipTarget.Next:
          await spotify.player.nextAsync();
          break;
        default:
          throw new Error("Invalid Skip Direction");
      }
      return {
        success: true,
        outputs: {
          trackWasSkipped: true,
        },
      };
    } catch (error) {
      return {
        success: false,
        outputs: {
          trackWasSkipped: false,
          error: getErrorMessage(error),
        },
      };
    }
  },
};
