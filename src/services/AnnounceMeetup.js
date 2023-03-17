const _ = require("lodash");
const db = require("../models");
const ErrorAssistant = require("../helpers/ErrorAssistant");
const MeetupAnnouncement = require("../views/MeetupAnnouncement");
const MeetupScheduledResponse = require("../views/MeetupScheduledResponse");

class AnnounceMeetup {
  static async ignore({ respond }) {
    await respond({
      text: "Got it! You can announce later using the blah blah blah command",
      replace_original: true,
    });
  }

  static async announce(app, payload) {
    const { action, body, respond } = payload;
    const { state } = body;
    const { channel } = MeetupScheduledResponse.getFormValues(state);
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
        blocks: MeetupAnnouncement.render(meetup),
      });

      await respond({
        text: "Announcement shared!",
        replace_original: true,
      });
    } catch (e) {
      await helper.handleError(e);
    }
  }
}

module.exports = AnnounceMeetup;
