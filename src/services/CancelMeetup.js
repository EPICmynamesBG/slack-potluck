const DeleteAnnouncementPosting = require("./DeleteAnnouncementPosting");
const MeetupCancellation = require("../views/MeetupCancellation");
const PayloadHelper = require('../helpers/PayloadHelper');
const db = require('../models');

class CancelMeetup {
  static async execute(app, payload) {
    const { action } = payload;
    const payloadHelper = new PayloadHelper(payload);
    const meetupId = action.value;
    const meetup = await db.Meetup.findByPk(meetupId);
    if (!meetup) {
      throw new Error(`Meetup ${meetupId} not found`);
    }
    const announcements = await db.MeetupAnnouncement.findAll({
      where: {
        meetupId,
      },
    });
    await DeleteAnnouncementPosting.execute(app, meetup, announcements);
    await meetup.destroy();

    const { channel = payloadHelper.getChannel() } =
    payloadHelper.getPrivateMetadata();
    await app.client.chat.postEphemeral({
      channel,
      user: payloadHelper.getUserId(),
      text: "Meetup cancelled!",
      blocks: MeetupCancellation.render(meetup),
    });
  }
}

module.exports = CancelMeetup;
