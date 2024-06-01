import { spotify } from "@/main";
import { getErrorMessage } from "@utils/errors";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

export enum SpotifySkipTarget {
  Previous = "Previous",
  Next = "Next",
}

export const SpotifySkipTrackEffect: Firebot.EffectType<{
  target: SpotifySkipTarget;
}> = {
  definition: {
    id: "oceanity-spotify:skip-track",
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
    <eos-container header="Skip Direction">
      <div class="btn-group">
        <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          <span class="list-effect-type">{{effect.target ? effect.target : 'Skip Direction...'}}</span> <span class="caret"></span>
        </button>
        <ul class="dropdown-menu">
          <li ng-click="effect.target = 'Next'">
            <a href>Next</a>
          </li>
          <li ng-click="effect.target = 'Previous'">
            <a href>Previous</a>
          </li>
        </ul>
      </div>
    </eos-container>
  `,

  // @ts-expect-error ts6133: Variables must be named consistently
  optionsController: ($scope: any, backendCommunicator: any, $q: any) => {},

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
