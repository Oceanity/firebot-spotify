import { spotify } from "@/main";
import { trackSummaryFromDetails } from "@/utils/spotify/player/track";
import { getErrorMessage } from "@/utils/string";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

export const SpotifyFindAndEnqueueTrackEffect: Firebot.EffectType<{
  query: string;
  queuedBy: string;
  playlistId: string;
  filterExplicit: boolean;
  allowDuplicates: boolean;
}> = {
  definition: {
    id: "oceanity-spotify:request-song",
    name: "Spotify Premium: Find and Enqueue Track",
    description: "Searches for a track to add to your Spotify queue",
    icon: "fab fa-spotify",
    categories: ["integrations"],
    //@ts-expect-error ts2353
    outputs: [
      {
        label: "Track was enqueued",
        description:
          "True if the track was enqueued successfully, false if not.",
        defaultName: "trackWasEnqueued",
      },
      {
        label: "Found Track",
        description: "Summary of the track that was enqueued",
        defaultName: "spotifyTrack",
      },
      {
        label: "Response Data",
        description:
          "Track information of the enqueued track if the procedure was successful, an error message if not.",
        defaultName: "spotifyResponse",
      },
    ],
  },

  optionsTemplate: `
    <!--<eos-container header="Queued By (Optional)" pad-top="true">
      <p class="muted">Username of user who queued the track (for cancelling/skipping purposes)</p>
      <input ng-model="effect.queuedBy" type="text" class="form-control" id="chat-text-setting" placeholder="Queued By" menu-position="under" replace-variables/>
    </eos-container>-->
    <eos-container header="Track Info" pad-top="true">
      <p class="muted">Search query or shareable link for track to add to your Spotify Queue</p>
      <input ng-model="effect.query" type="text" class="form-control" id="chat-text-setting" placeholder="Search Query" menu-position="under" replace-variables/>
      <div style="display: flex; flex-direction: row; margin: 15px 0;">
        <firebot-checkbox label="Exclude explicit content" tooltip="Exclude explicit content from search results" model="effect.filterExplicit" style="margin: 0px 15px 0px 0px" class="ng-isolate-scope">
          <label class="control-fb control--checkbox ng-binding" style="margin: 0px 15px 0px 0px"> Send as reply <!-- ngIf: $ctrl.tooltip --><tooltip ng-if="$ctrl.tooltip" text="$ctrl.tooltip" placement="" class="ng-scope ng-isolate-scope">
            <i class="fal fa-question-circle" style="" ng-class="{'fa-question-circle': $ctrl.type === 'question', 'fa-info-circle': $ctrl.type === 'info' }" uib-tooltip="Allow duplicate songs to be added to the queue" tooltip-placement="" tooltip-append-to-body="true" aria-hidden="true"></i>
          </tooltip><!-- end ngIf: $ctrl.tooltip -->
            <input type="checkbox" ng-model="$ctrl.model" ng-disabled="$ctrl.disabled" class="ng-pristine ng-untouched ng-valid ng-empty" aria-invalid="false">
            <div class="control__indicator"></div>
          </label>
        </firebot-checkbox>
      </div>
      <div style="display: flex; flex-direction: row; margin: 15px 0;">
        <firebot-checkbox label="Allow duplicate tracks" tooltip="Allow users to queue songs that are already in the queue" model="effect.allowDuplicates" style="margin: 0px 15px 0px 0px" class="ng-isolate-scope">
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
    const { query, queuedBy, allowDuplicates, filterExplicit } = event.effect;
    const spotifyUrlRegex =
      /(?:https?:)\/\/open\.spotify\.com\/track\/(.+)(?:\?.+)/;

    try {
      const matches = query.match(spotifyUrlRegex);

      const track = matches
        ? await spotify.getTrackAsync(matches[1])
        : (
            await spotify.searchAsync(query, "track", {
              filterExplicit,
            })
          ).tracks.items[0];

      if (!track) throw new Error("Track not found");

      await spotify.player.queue.pushAsync(track.uri, allowDuplicates);

      track.queue_position = await spotify.player.queue.findIndexAsync(
        track.uri
      );

      return {
        success: true,
        outputs: {
          trackWasEnqueued: true,
          spotifyResponse: track,
          spotifyTrack: trackSummaryFromDetails(track),
        },
      };
    } catch (error) {
      return {
        success: false,
        outputs: {
          trackWasEnqueued: false,
          error: getErrorMessage(error),
          spotifyTrack: null,
        },
      };
    }
  },
};
