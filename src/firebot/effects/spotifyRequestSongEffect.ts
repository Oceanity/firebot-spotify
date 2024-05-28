import { Firebot } from "@crowbartools/firebot-custom-scripts-types";
import Spotify from "@utils/spotify";
import { logger } from "@utils/firebot";

export const spotifyRequestSongEffect: Firebot.EffectType<{
  query: string;
  queuedBy: string;
  playlistId: string;
  allowDuplicates: boolean;
}> = {
  definition: {
    id: "spotify:request-song",
    name: "Spotify: Request Song",
    description: "Request a song to add to your Spotify playlist",
    icon: "fab fa-spotify",
    categories: ["integrations"],
    //@ts-expect-error ts2353
    outputs: [
      {
        label: "Success status",
        description:
          "returns true if the message was sent successfully, false otherwise.",
        defaultName: "spotifySuccess",
      },
      {
        label: "Response Data",
        description:
          "Returns the track information of the enqueued track or a error message if the procedure failed.",
        defaultName: "spotifyResponse",
      },
    ],
  },

  optionsTemplate: `
    <eos-container header="Queued By (Optional)" pad-top="true">
      <p class="muted">Username of user who queued the track (for cancelling/skipping purposes)</p>
      <input ng-model="effect.queuedBy" type="text" class="form-control" id="chat-text-setting" placeholder="Queued By" menu-position="under" replace-variables/>
    </eos-container>
    <eos-container header="Spotify Info" pad-top="true">
      <p class="muted">Search query for track to add to your Spotify Queue</p>
      <input ng-model="effect.query" type="text" class="form-control" id="chat-text-setting" placeholder="Search Query" menu-position="under" replace-variables/>
      <div style="display: flex; flex-direction: row; margin: 15px 0;">
        <firebot-checkbox label="Allow duplicate tracks" tooltip="Allow users to queue songs that are already in the queue" model="effect.allowduplicates" style="margin: 0px 15px 0px 0px" class="ng-isolate-scope">
          <label class="control-fb control--checkbox ng-binding" style="margin: 0px 15px 0px 0px"> Send as reply <!-- ngIf: $ctrl.tooltip --><tooltip ng-if="$ctrl.tooltip" text="$ctrl.tooltip" placement="" class="ng-scope ng-isolate-scope">
              <i class="fal fa-question-circle" style="" ng-class="{'fa-question-circle': $ctrl.type === 'question', 'fa-info-circle': $ctrl.type === 'info' }" uib-tooltip="Allow duplicate songs to be added to the queue" tooltip-placement="" tooltip-append-to-body="true" aria-hidden="true"></i>
          </tooltip><!-- end ngIf: $ctrl.tooltip -->
              <input type="checkbox" ng-model="$ctrl.model" ng-disabled="$ctrl.disabled" class="ng-pristine ng-untouched ng-valid ng-empty" aria-invalid="false">
              <div class="control__indicator"></div>
          </label>
        </firebot-checkbox>
      </div>
    </eos-container>
  `,

  // @ts-expect-error ts6133: Variables must be named consistently
  optionsController: ($scope: any, backendCommunicator: any, $q: any) => {},

  optionsValidator: (effect) => {
    const errors = [];
    if (!effect.query) {
      errors.push("Search Query is required!");
    }
    return errors;
  },

  onTriggerEvent: async (event) => {
    logger.info(
      `Searching and enqueueing track matching query: ${event.effect.query}`
    );
    const encodedQuery = encodeURIComponent(event.effect.query);

    const { success, data } = await Spotify.findAndEnqueueTrackAsync(
      encodedQuery
    );

    return {
      success: true,
      outputs: {
        spotifySuccess: success,
        spotifyResponse: data,
      },
    };
  },
};
