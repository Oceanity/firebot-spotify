import { spotify } from "@/main";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { getErrorMessage } from "@/utils/string";

type EffectParams = { playbackState: string };

export const SpotifyChangePlaybackStateEffect: Firebot.EffectType<EffectParams> =
  {
    definition: {
      id: "change-playback-state",
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
      <eos-container header="Playback State" pad-top="true">
        <dropdown-select options="playbackStateOptions" selected="effect.playbackState"></dropdown-select>
      </eos-container>
    `,

    optionsController: ($scope: EffectScope<EffectParams>) => {
      $scope.playbackStateOptions = ["Play", "Pause", "Toggle"];

      if ($scope.effect.playbackState == null) {
        $scope.effect.playbackState = $scope.playbackStateOptions[0];
      }
    },

    optionsValidator: () => {
      return [];
    },

    onTriggerEvent: async (event) => {
      const { playbackState } = event.effect;

      try {
        switch (playbackState) {
          case "Play":
            await spotify.player.playAsync();
            break;
          case "Pause":
            await spotify.player.pauseAsync();
            break;
          case "Toggle":
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
