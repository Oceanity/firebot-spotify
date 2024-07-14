import { spotify } from "@/main";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import { getErrorMessage } from "@/utils/string";
import { logger } from "@/utils/firebot";

type EffectParams = { username: string; amount: string };

export const SpotifyCancelUserQueuesEffect: Firebot.EffectType<EffectParams> = {
  definition: {
    id: "skip-user-queues",
    name: "Spotify Premium: Cancel User Queues",
    description:
      "Skips the last or all queues made by provided user (or all tracks if no user is provided)",
    icon: "fab fa-spotify",
    categories: ["integrations"],
    //@ts-expect-error ts2353
    outputs: [
      {
        label: "Track(s) were skipped",
        description:
          "Will be true if the track(s) were set to auto-skip successfully, false if not or if no tracks were effected.",
        defaultName: "tracksWereSkipped",
      },
      {
        label: "Skipped Tracks",
        description: "An array of tracks that were set to auto-skip.",
        defaultName: "skippedTracks",
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
      <eos-container header="User" pad-top="true">
        <firebot-input
          input=title="Username"
          model="effect.username"
          placeholder-text="Username of user to cancel queues for, or blank to effect entire queue"
          style="border-radius:8px;overflow:hidden;" />
      </eos-container>
      <eos-container header="Tracks to Cancel" pad-top="true">
        <dropdown-select options="amountOptions" selected="effect.amount"></dropdown-select>
      </eos-container>
    `,

  optionsController: ($scope: EffectScope<EffectParams>) => {
    $scope.amountOptions = ["Last Added", "All"];

    if ($scope.effect.amount == null) {
      $scope.effect.amount = $scope.amountOptions[0];
    }
  },

  optionsValidator: () => {
    return [];
  },

  onTriggerEvent: async (event) => {
    try {
      const { username, amount } = event.effect;
      const onlyLast = amount === "Last Added";

      const tracks = spotify.player.queue.cancelUserQueues(username, onlyLast);

      logger.info(`Skipped tracks: ${JSON.stringify(tracks)}`);

      return {
        success: true,
        outputs: {
          tracksWereSkipped: tracks.length !== 0,
          skippedTracks: tracks,
          error: null,
        },
      };
    } catch (error) {
      return {
        success: false,
        outputs: {
          playbackStateChanged: false,
          skippedTracks: [],
          error: getErrorMessage(error),
        },
      };
    }
  },
};
