const _ = require("lodash");
const db = require("../models");
const ErrorAssistant = require("../helpers/ErrorAssistant");

class MeetupRegistration {
  static ACTIONS = {
    ADULT_SIGNUP: "form.signup.adult_count",
    CHILD_SIGNUP: "form.signup.child_count",
  };
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
    console.log("INIT ATTENDING");
    const { action, body } = payload;
    const helper = new ErrorAssistant(app, payload);
    const meetupId = action.value;

    const registration = await this._createOrUpdateRegistration(helper, {
      meetupId,
      slackUserId: body.user.id,
      slackTeamId: body.user.team_id,
      adultRegistrationCount: 1,
      childRegistrationCount: 0,
      skipUpdatesForNonZeroRegistration: true,
    });
  }

  static getRegistrationFormValues(viewState) {
    const adultCount = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.ADULT_SIGNUP}`,
      this.ACTIONS.ADULT_SIGNUP,
      "value",
    ]);
    const childCount = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.CHILD_SIGNUP}`,
      this.ACTIONS.CHILD_SIGNUP,
      "value",
    ]);
    return {
      adultCount,
      childCount,
    };
  }

  static async updateAttendance(app, payload) {
    const { body, view } = payload;
    const meta = JSON.parse(_.get(view, "private_metadata", "{}"));
    const { meetupId, channel = body.user.id } = meta;
    const { adultCount, childCount } = this.getRegistrationFormValues(
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

    console.log(body);
    await app.client.chat.postEphemeral({
      channel: body.container.channel_id,
      user: body.user.id,
      text: "We're sad you can't make it; if you change your mind, let us know!",
    });
  }
}

module.exports = MeetupRegistration;
