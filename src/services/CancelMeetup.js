const DeleteAnnouncementPosting = require("./DeleteAnnouncementPosting");
const MeetupCancellation = require("../views/MeetupCancellation");
const PayloadHelper = require('../helpers/PayloadHelper');
const db = require('../models');
const { tryJoinChannel } = require('../helpers/ChannelJoiner');

class CancelMeetup {
  static async execute(payload) {
    const { action, client } = payload;
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
    await DeleteAnnouncementPosting.execute(client, meetup, announcements);
    await meetup.destroy();

    const { channel = payloadHelper.getChannel() } =
    payloadHelper.getPrivateMetadata();
    await tryJoinChannel(client, channel);
    await client.chat.postEphemeral({
      channel,
      user: payloadHelper.getUserId(),
      text: "Meetup cancelled!",
      blocks: MeetupCancellation.render(meetup),
    });
  }
}

module.exports = CancelMeetup;
