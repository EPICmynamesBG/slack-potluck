const _ = require("lodash");
const db = require("../models");
const ErrorAssistant = require("../helpers/ErrorAssistant");
const RegistrationForm = require("../views/RegistrationModal/RegistrationForm");
const SyncAnnouncementPosting = require("./SyncAnnouncementPosting");

class MeetupRegistration {
  static async _createOrUpdateRegistration(
    errorHelper,
    {
      meetupId,
      slackUserId,
      slackTeamId,
      adultRegistrationCount,
      childRegistrationCount,
      skipUpdatesForNonZeroRegistration = false,
    }
  ) {
    try {
      await db.Meetup.findByPk(Number.parseInt(meetupId, 10));
    } catch (e) {
      await errorHelper.handleError(e, "Meetup not found");
      return;
    }
    try {
      let registration = await db.MeetupRegistration.findOne({
        where: {
          meetupId,
          createdBy: slackUserId,
          slackTeamId,
        },
      });
      if (registration) {
        const existingRegistrationCount =
          registration.adultRegistrationCount +
          registration.childRegistrationCount;
        if (
          skipUpdatesForNonZeroRegistration &&
          existingRegistrationCount > 0
        ) {
          return registration;
        }
        registration.adultRegistrationCount = adultRegistrationCount;
        registration.childRegistrationCount = childRegistrationCount;
        registration.updatedAt = new Date();
        await registration.save();
      } else {
        registration = await db.MeetupRegistration.create({
          meetupId,
          createdBy: slackUserId,
          slackTeamId,
          adultRegistrationCount,
          childRegistrationCount,
        });
      }
      return registration;
    } catch (e) {
      await errorHelper.handleError(e, "Failed to store response");
      return;
    }
  }

  static async initAttending(app, payload) {
    const { action, body } = payload;
    const helper = new ErrorAssistant(app, payload);
    const meetupId = action.value;

    const result = await this._createOrUpdateRegistration(helper, {
      meetupId,
      slackUserId: body.user.id,
      slackTeamId: body.user.team_id,
      adultRegistrationCount: 1,
      childRegistrationCount: 0,
      skipUpdatesForNonZeroRegistration: true,
    });
    if (result) {
      await this.onMeetupRegistrationChange(app, meetupId);
    }
    return result;
  }

  static async updateAttendance(app, payload) {
    const { body, view } = payload;
    const meta = JSON.parse(_.get(view, "private_metadata", "{}"));
    const { meetupId } = meta;
    const { adultCount, childCount } = RegistrationForm.getFormValues(
      view.state
    );

    const registration = await this._createOrUpdateRegistration(
      new ErrorAssistant(app, payload),
      {
        meetupId,
        slackUserId: body.user.id,
        slackTeamId: body.user.team_id,
        adultRegistrationCount: adultCount,
        childRegistrationCount: childCount,
      }
    );
    if (registration) {
      await this.onMeetupRegistrationChange(app, meetupId);
    }
    return registration;
  }

  static async notAttending(app, payload) {
    const { action, body } = payload;
    const helper = new ErrorAssistant(app, payload);
    const meetupId = action.value;

    const registration = await this._createOrUpdateRegistration(helper, {
      meetupId,
      slackUserId: body.user.id,
      slackTeamId: body.user.team_id,
      adultRegistrationCount: 0,
      childRegistrationCount: 0,
    });
    if (!registration) {
      return;
    }
    await this.onMeetupRegistrationChange(app, meetupId);

    await app.client.chat.postEphemeral({
      channel: body.container.channel_id,
      user: body.user.id,
      text: "We're sad you can't make it; if you change your mind, let us know!",
    });
  }

  static async onMeetupRegistrationChange(app, meetupId) {
    SyncAnnouncementPosting.defer(app, meetupId);
  }
}

module.exports = MeetupRegistration;
