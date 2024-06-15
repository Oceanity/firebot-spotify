import { spotify } from "@/main";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { getErrorMessage } from "@/utils/string";

export enum SpotifyPlaybackState {
  Play = "Play",
  Pause = "Pause",
  Toggle = "Toggle",
}

export type SpotifyChangePlaybackStateOptions = {
  playState: SpotifyPlaybackState;
};

export const SpotifyChangePlaybackStateEffect: Firebot.EffectType<SpotifyChangePlaybackStateOptions> =
  {
    definition: {
      id: "oceanity-spotify:change-playback-state",
      name: "Spotify Premium: Change Playback State",
      description: "Changes playback state of active Spotify device",
      icon: "fab fa-spotify",
      categories: ["integrations"],
      //@ts-expect-error ts2353
      outputs: [
        {
          label: "Playback state was changed",
          description:
            "Will be true if the playback state was changed successfully, false if not.",
          defaultName: "playbackStateChanged",
        },
        {
          label: "Error Message",
          description:
            "If the playback playback state was not changed successfully, will contain an error message.",
          defaultName: "error",
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

      try {
        switch (playState) {
          case SpotifyPlaybackState.Play:
            await spotify.player.playAsync();
            break;
          case SpotifyPlaybackState.Pause:
            await spotify.player.pauseAsync();
            break;
          case SpotifyPlaybackState.Toggle:
            await spotify.player.playPauseAsync();
            break;
        }

        return {
          success: true,
          outputs: {
            playbackStateChanged: true,
            error: null,
          },
        };
      } catch (error) {
        return {
          success: false,
          outputs: {
            playbackStateChanged: false,
            error: getErrorMessage(error),
          },
        };
      }
    },
  };
