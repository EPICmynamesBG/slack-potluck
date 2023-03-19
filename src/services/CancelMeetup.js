const DeleteAnnouncementPosting = require("./DeleteAnnouncementPosting");
const MeetupCancellation = require("../views/MeetupCancellation");
const PayloadHelper = require('../helpers/PayloadHelper');
const db = require('../models');
const ManageMeetupModalPostCancellation = require("../views/ManageMeetupModal/ManageMeetupModalPostCancellation");

class CancelMeetup {
  static async execute(app, payload) {
    const { action, body, context } = payload;
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
    // await DeleteAnnouncementPosting.execute(app, meetup, announcements);
    // await meetup.destroy();

    const { channel = payloadHelper.getChannel() } =
    payloadHelper.getPrivateMetadata();
    await app.client.chat.postEphemeral({
      channel,
      user: payloadHelper.getUserId(),
      text: "Meeting cancelled!",
      blocks: MeetupCancellation.render(meetup),
    });
    // const modal = new ManageMeetupModalPostCancellation(app);
    // await modal.render({
    //     channel: payloadHelper.getChannel(),
    //     botToken: context.botToken,
    //     triggerId: body.trigger_id,
    //     meetup,
    //     hash: body.view.hash,
    //     slackUserId: body.user.id,
    //     slackTeamId: body.user.team_id,
    // });
  }
}

module.exports = CancelMeetup;
