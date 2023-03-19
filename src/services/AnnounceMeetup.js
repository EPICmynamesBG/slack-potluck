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

  static async announce(app, payload) {
    const { action, body } = payload;
    const payloadHelper = new PayloadHelper(payload);
    const state = payloadHelper.getState();
    const { channel } = MeetupScheduledResponse.getFormValues(state);
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
    const helper = new ErrorAssistant(app, payload);
    const meetupId = Number.parseInt(action.value, 10);
    let posted;
    try {
      const meetup = await db.Meetup.findByPk(meetupId);

      posted = await app.client.chat.postMessage({
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
