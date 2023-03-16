const _ = require("lodash");
const db = require("../models");
const DateTimeHelpers = require("../helpers/datetime");
const ErrorAssistant = require("../helpers/ErrorAssistant");
const FoodSignup = require("./FoodSignup");

class AnnounceMeetup {
  static ChannelSelectAction = "meetup.created.announce.channel_select";
  static SubmitAnnounceAction = "meetup.created.announce.submit";
  static IgnoreAnnounceAction = "meetup.created.announce.ignore";
  static GoogleMapLinkAction = "meetup.location.url.click";

  static async ignore({ respond }) {
    await respond({
      text: "Got it! You can announce later using the blah blah blah command",
      replace_original: true,
    });
  }

  static async announce(app, payload) {
    const { action, body, respond } = payload;
    const { state } = body;
    const channel =
      _.get(state, [
        "values",
        "meetup.created.actions",
        AnnounceMeetup.ChannelSelectAction,
        "selected_channel",
      ]) ||
      _.get(state, [
        "values",
        "meetup.created.actions",
        AnnounceMeetup.ChannelSelectAction,
        "selected_conversation",
      ]);
    if (!channel) {
      await respond({
        response_type: "ephemeral",
        replace_original: false,
        text: "Hmm, but what channel?",
      });
      return;
    }
    const helper = new ErrorAssistant(app, payload);
    const meetupId = action.value;
    try {
      const meetup = await db.Meetup.findByPk(Number.parseInt(meetupId, 10));

      await app.client.chat.postMessage({
        channel,
        unfurl_links: false,
        blocks: this.renderAnnouncementBlock(meetup),
      });

      await respond({
        text: "Announcement shared!",
        replace_original: true,
      });
    } catch (e) {
      await helper.handleError(e);
    }
  }

  static renderAnnouncementBlock(meetup) {
    const blocks = [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: "Upcoming Meetup!",
        },
      },
      ...AnnounceMeetup.renderMeetupDetails(meetup),
    ];
    if (meetup.includeFoodSignup) {
      const signupBlocks = FoodSignup.renderSignupActions(meetup);
      blocks.push(...signupBlocks);
    }
    console.log('blocks', blocks);
    return blocks;
  }

  static renderMeetupAdditionalNotes(notes = null) {
    if (!notes) {
      return;
    }
    return {
      type: "context",
      elements: [
        {
          type: "plain_text",
          emoji: true,
          text: ":thought_balloon:",
        },
        {
          type: "mrkdwn",
          text: notes,
        },
      ],
    };
  }

  static renderMeetupDetails(meetup) {
    const formattedTime = DateTimeHelpers.humanReadable(meetup.timestamp);

    const addressUrl = new URL("https://www.google.com/maps/dir/?api=1");
    addressUrl.searchParams.set(
      "destination",
      meetup.locationAddress.replace("\n", ",")
    );
    const formattedLocation = meetup.locationAlias
      ? `*${meetup.locationAlias}*\n${meetup.locationAddress}`
      : meetup.locationAddress;

    const details = [
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `:clock5: *${formattedTime}*`,
          },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:pushpin: ${formattedLocation}`,
        },
        accessory: {
          type: "button",
          action_id: this.GoogleMapLinkAction,
          text: {
            type: "plain_text",
            text: "Directions",
          },
          url: addressUrl.toString(),
        },
      },
    ];
    if (meetup.additionalNotes) {
      details.push(this.renderMeetupAdditionalNotes(meetup.additionalNotes));
    }
    if (meetup.includeFoodSignup) {
      details.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Please bring :shallow_pan_of_food: :yum:",
          },
        ],
      });
    }
    return details;
  }
}

module.exports = AnnounceMeetup;
