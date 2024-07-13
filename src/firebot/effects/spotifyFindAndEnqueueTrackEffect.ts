import { spotify } from "@/main";
import { trackSummaryFromDetails } from "@/utils/spotify/player/track";
import { getErrorMessage } from "@/utils/string";
import { Firebot } from "@crowbartools/firebot-custom-scripts-types";

type EffectParams = {
  query: string;
  queuedBy: string;
  playlistId: string;
  filterExplicit: boolean;
  allowDuplicates: boolean;
};

export const SpotifyFindAndEnqueueTrackEffect: Firebot.EffectType<EffectParams> =
  {
    definition: {
      id: "request-song",
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
          <firebot-input 
            input-title="Search"
            model="effect.query" 
            placeholder-text="Search query or link to track to add to your Spotify Queue"
            style="border-radius:8px;overflow:hidden;" />
          <div style="display: flex; flex-direction: column; margin: 15px 0 0px;">
            <firebot-checkbox
              label="Exclude explicit tracks"
              tooltip="Ignores explicit content from search results"
              model="effect.filterExplicit" />
            <firebot-checkbox
              label="Allow duplicate tracks"
              tooltip="Allow users to queue songs that are already in the queue"
              model="effect.allowDuplicates" />
          </div>
        </eos-container>
      `,

    // @ts-expect-error ts6133: Variables must be named consistently
    optionsController: ($scope: EffectScope<EffectParams>) => {},

    optionsValidator: (effect) => {
      const errors = [];
      if (!effect.query) {
        errors.push("Search Query is required!");
      }
      return errors;
    },

    onTriggerEvent: async (event) => {
      const { query, queuedBy, allowDuplicates, filterExplicit } = event.effect;

      try {
        const searchOptions = {
          filterExplicit,
          allowDuplicates,
        };

        const linkId = spotify.player.track.getIdFromTrackUrl(query);

        const track = linkId
          ? await spotify.getTrackAsync(linkId, searchOptions)
          : (await spotify.searchAsync(query, "track", searchOptions)).tracks
              .items[0];

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
          },
        };
      }
    },
  };
