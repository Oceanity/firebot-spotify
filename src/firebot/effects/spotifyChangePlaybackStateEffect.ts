import { logger } from "@utils/firebot";
import Spotify from "@utils/spotify";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

export enum SpotifyPlaybackState {
  Play = "Play",
  Pause = "Pause",
  Toggle = "Toggle",
}

export const spotifyChangePlaybackStateEffect: Firebot.EffectType<{
  playState: SpotifyPlaybackState;
}> = {
  definition: {
    id: "spotify:change-playback-state",
    name: "Spotify: Change Playback State",
    description: "Changes playback state of active Spotify Device",
    icon: "fab fa-spotify",
    categories: ["integrations"],
    //@ts-expect-error ts2353
    outputs: [
      {
        label: "Success status",
        description:
          "Returns true if the playback state was changed successfully, otherwise false.",
        defaultName: "spotifySuccess",
      },
    ],
  },

  optionsTemplate: `
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
    if (!effect.playState) {
      errors.push("Search Query is required!");
    }
    return errors;
  },

  onTriggerEvent: async (event) => {
    const { playState } = event.effect;

    const spotifySuccess = await Spotify.changePlyabckStateAsync(playState);

    return {
      success: true,
      outputs: {
        spotifySuccess,
      },
    };
  },
};
