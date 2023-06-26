const _ = require("lodash");
const db = require("../models");
const ErrorAssistant = require("../helpers/ErrorAssistant");
const RegistrationForm = require("../views/RegistrationModal/RegistrationForm");
const SyncAnnouncementPosting = require("./SyncAnnouncementPosting");
const RegistrationGroupedUsers = require("./RegistrationGroupedUsers");
const { tryJoinChannel } = require('../helpers/ChannelJoiner');

class MeetupRegistration {

  /**
   * 
   * @param {*} errorHelper 
   * @param {*} param1 
   * @returns [registration, registrationCountsChange: bool]
   */
  static async _createOrUpdateRegistration(
    errorHelper,
    {
      meetupId,
      slackUserId,
      slackTeamId,
      adultRegistrationCount,
      childRegistrationCount,
      skipUpdatesForNonZeroRegistration = false,
      notes = undefined
    }
  ) {
    try {
      await db.Meetup.findByPk(Number.parseInt(meetupId, 10));
    } catch (e) {
      await errorHelper.handleError(e, "Meetup not found");
      return [undefined, false];
    }
    let countsHaveChanged = false;
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
          return [registration, countsHaveChanged];
        }
        countsHaveChanged = registration.adultRegistrationCount != adultRegistrationCount ||
                            registration.childRegistrationCount != childRegistrationCount;
        registration.adultRegistrationCount = adultRegistrationCount;
        registration.childRegistrationCount = childRegistrationCount;
        registration.updatedAt = new Date();
        if (notes) {
          registration.notes = notes;
        }
        await registration.save();
      } else {
        registration = await db.MeetupRegistration.create({
          meetupId,
          createdBy: slackUserId,
          slackTeamId,
          adultRegistrationCount,
          childRegistrationCount,
          notes
        });
        countsHaveChanged = true;
        await RegistrationGroupedUsers.tryLinkGroupedRegistration(registration, errorHelper);
      }
      return [registration, countsHaveChanged];
    } catch (e) {
      await errorHelper.handleError(e, "Failed to store response");
      return [undefined, countsHaveChanged];
    }
  }


  static async initAttending(payload) {
    const { action, body, client } = payload;
    const helper = new ErrorAssistant(payload);
    const meetupId = action.value;

    const [result, countsHaveChanged] = await this._createOrUpdateRegistration(helper, {
      meetupId,
      slackUserId: body.user.id,
      slackTeamId: body.user.team_id,
      adultRegistrationCount: 1,
      childRegistrationCount: 0,
      skipUpdatesForNonZeroRegistration: true,
    });
    if (countsHaveChanged) {
      await this.onMeetupRegistrationChange(client, meetupId);
    }
    return result;
  }

  static async updateAttendance(payload) {
    const { body, client, view } = payload;
    const meta = JSON.parse(_.get(view, "private_metadata", "{}"));
    const { meetupId } = meta;
    const { adultCount, childCount = 0, notes = undefined } = RegistrationForm.getFormValues(
      view.state
    );

    const [registration, countsHaveChanged] = await this._createOrUpdateRegistration(
      new ErrorAssistant(payload),
      {
        meetupId,
        slackUserId: body.user.id,
        slackTeamId: body.user.team_id,
        adultRegistrationCount: adultCount,
        childRegistrationCount: childCount,
        notes
      }
    );
    await RegistrationGroupedUsers.manageIncludedUsersFromState(
      new ErrorAssistant(payload), registration, view.state);
    if (countsHaveChanged) {
      await this.onMeetupRegistrationChange(client, meetupId);
    }
    return registration;
  }

  static async notAttending(payload) {
    const { action, body, client } = payload;
    const helper = new ErrorAssistant(payload);
    const meetupId = action.value;

    const [registration, countsHaveChanged] = await this._createOrUpdateRegistration(helper, {
      meetupId,
      slackUserId: body.user.id,
      slackTeamId: body.user.team_id,
      adultRegistrationCount: 0,
      childRegistrationCount: 0,
    });
    if (!registration) {
      return;
    }
    if (countsHaveChanged) {
      await this.onMeetupRegistrationChange(client, meetupId);
    }

    await tryJoinChannel(client, body.container.channel_id);
    await client.chat.postEphemeral({
      channel: body.container.channel_id,
      user: body.user.id,
      text: "We're sad you can't make it; if you change your mind, let us know!",
    });
  }

  static async onMeetupRegistrationChange(client, meetupId) {
    SyncAnnouncementPosting.defer(client, meetupId);
  }
}

module.exports = MeetupRegistration;
