const _ = require("lodash");
const db = require("../models");
const DateTimeHelpers = require("../helpers/datetime");
const CreateMeetupForm = require("../views/CreateMeetupModal/CreateMeetupForm");

class CreateMeetup {
  static _sanitizeFormValues(formValues) {
    const clone = { ...formValues };
    if (clone.whereFriendly) {
      clone.whereFriendly = clone.whereFriendly.replace('\n', ' ');
    }
    return clone;
  }

  static async execute(viewState, slackUserId, slackTeamId) {
    let formValues = CreateMeetupForm.getFormValues(viewState);
    formValues = CreateMeetup._sanitizeFormValues(formValues);
    const meetup = await db.Meetup.create({
      timestamp: DateTimeHelpers.dateFromUnix(formValues.when),
      locationAddress: formValues.whereAddress,
      locationAlias: formValues.whereFriendly,
      createdBy: slackUserId,
      slackTeamId,
      includeFoodSignup: formValues.includeFoodSignup,
      additionalNotes: formValues.additionalNotes
    });
    return meetup;
  }
}

module.exports = CreateMeetup;
