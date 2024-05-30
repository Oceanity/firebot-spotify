import Spotify from "@utils/spotify";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

export enum SpotifySkipTarget {
  Previous = "Previous",
  Next = "Next",
}

export const spotifySkipTrackEffect: Firebot.EffectType<{
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
          <span class="list-effect-type">{{effect.target ? effect.target : 'Next'}}</span> <span class="caret"></span>
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

  optionsValidator: () => [],

  onTriggerEvent: async (event) => {
    const { target } = event.effect;

    const spotifySuccess = await Spotify.skipTrackAsync(
      target ?? SpotifySkipTarget.Next
    );

    return {
      success: true,
      outputs: {
        spotifySuccess,
      },
    };
  },
};
