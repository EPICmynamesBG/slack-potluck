const _ = require("lodash");
const db = require("../models");
const DateTimeHelpers = require("../helpers/datetime");
const CreateMeetupForm = require("../views/CreateMeetupModal/CreateMeetupForm");

class CreateMeetup {
  static async execute(viewState, slackUserId, slackTeamId) {
    const formValues = CreateMeetupForm.getFormValues(viewState);
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
