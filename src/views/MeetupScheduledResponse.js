const _ = require('lodash');
const MeetupDetails = require("./MeetupDetails");
const AnnounceMeetupActions = require('./AnnounceMeetupActions');

class MeetupScheduledResponse {
  static BLOCK_ID = AnnounceMeetupActions.BLOCK_ID;
  static ACTIONS = {
    ...AnnounceMeetupActions.ACTIONS
  };

  static getFormValues(state) {
    return AnnounceMeetupActions.getFormValues(state);
  }

  static render(meetup) {
    return [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Meetup scheduled!",
        },
      },
      ...MeetupDetails.render(meetup),
      ...AnnounceMeetupActions.render(meetup)
    ];
  }
}

module.exports = MeetupScheduledResponse;
