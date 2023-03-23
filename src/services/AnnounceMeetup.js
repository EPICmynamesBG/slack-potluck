const _ = require("lodash");
const db = require("../models");
const ErrorAssistant = require("../helpers/ErrorAssistant");
const MeetupAnnouncement = require("../views/MeetupAnnouncement");
const MeetupScheduledResponse = require("../views/MeetupScheduledResponse");
const PayloadHelper = require("../helpers/PayloadHelper");

class AnnounceMeetup {
  static async ignore({ respond }) {
    await respond({
      text: "Got it! You can announce later using the blah blah blah command",
      replace_original: true,
    });
  }

  static async joinChannel(client, channel) {
    try {
      await client.conversations.join({
        channel
      });
    } catch (e) {
      console.warn(`[AnnounceMeetup] Failed to join channel ${channel}`);
    }
  }

  static async announce(payload) {
    const { action, body, client } = payload;
    const payloadHelper = new PayloadHelper(payload);
    const state = payloadHelper.getState();
    const meetupId = Number.parseInt(action.value, 10);
    const { channel } = MeetupScheduledResponse.getFormValues(state, meetupId);
    if (!channel) {
      await payloadHelper.respond(
        {
          response_type: "ephemeral",
          replace_original: false,
          text: "Hmm, but what channel?",
        }
      );
      return;
    }
    const helper = new ErrorAssistant(payload);
    let posted;
    try {
      const meetup = await db.Meetup.findByPk(meetupId);

      await this.joinChannel(client, channel);

      posted = await client.chat.postMessage({
        channel,
        unfurl_links: false,
        blocks: MeetupAnnouncement.render(meetup),
      });

      await payloadHelper.respond({
        text: "Announcement shared!",
        replace_original: true,
      });
    } catch (e) {
      await helper.handleError(e);
      return;
    }

    try {
      await db.MeetupAnnouncement.create({
        meetupId,
        postingChannelId: posted.channel,
        postingMessageId: posted.message.ts,
        slackTeamId: body.user.team_id,
        createdBy: body.user.id
      });
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = AnnounceMeetup;
