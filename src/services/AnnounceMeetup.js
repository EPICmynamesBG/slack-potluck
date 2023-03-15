const _ = require("lodash");
const db = require("../models");
const DateTimeHelpers = require("../helpers/datetime");

class AnnounceMeetup {
  static ChannelSelectAction = "meetup.created.announce.channel_select";
  static SubmitAnnounceAction = "meetup.created.announce.submit";
  static IgnoreAnnounceAction = "meetup.created.announce.ignore";

  static async ignore({ respond }) {
    await respond({
      text: "Got it! You can announce later using the blah blah blah command",
      replace_original: true,
    });
  }

  static async announce({ action, body, respond }) {
    const { state } = body;
    const channel = _.get(state, [
      "values",
      "meetup.created.actions",
      AnnounceMeetup.ChannelSelectAction,
      "selected_channel",
    ]);
    if (!channel) {
      await respond({
        response_type: "ephemeral",
        replace_original: false,
        text: "Hmm, but what channel?",
      });
      return;
    }
    const meetupId = action.value;
    try {
      const meetup = await db.Meetup.findByPk(Number.parseInt(meetupId, 10));
      console.log(meetup);

      //   await app.client.postMessage({
      //       channel,
      //       unfurl_links: false,
      //       blocks: [
      //         {
      //             type: "section",
      //             text: {
      //               type: "plain_text",
      //               text: "Upcoming Meetup!",
      //             },
      //           },
      //         ...AnnounceMeetup.renderMeetupDetails(meetup),
      //         // { // TODO: setup food signup message
      //         //     type: "actions",

      //         // }
      //       ]
      //   });

      await respond({
        text: "Announcement shared!",
        replace_original: true,
      });
    } catch (e) {
      console.error(e);
    }
  }

  static renderMeetupDetails(meetup) {
    const formattedTime = DateTimeHelpers.humanReadable(meetup.timestamp);

    const addressUrl = new URL("https://www.google.com/maps/dir/?api=1");
    addressUrl.searchParams.set(
      "destination",
      meetup.locationAddress.replace("\n", ",")
    );
    const formattedLocation = meetup.locationAlias
      ? `*${meetup.locationAlias}*\n<${addressUrl.toString()}|${
          meetup.locationAddress
        }>`
      : `<${addressUrl.toString()}|${meetup.locationAddress}>`;

    return [
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            emoji: true,
            text: ":clock5:",
          },
          {
            type: "mrkdwn",
            text: `*${formattedTime}*`,
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            emoji: true,
            text: ":pushpin:",
          },
          {
            type: "mrkdwn",
            text: formattedLocation,
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "plain_text",
            emoji: true,
            text: ":thought_balloon:",
          },
          {
            type: "mrkdwn",
            text: "Additional comments -- coming soon!",
          },
        ],
      },
    ];
  }
}

module.exports = AnnounceMeetup;
