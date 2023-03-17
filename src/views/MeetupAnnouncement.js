const MeetupDetails = require("./MeetupDetails");
const QuickRegistrationActions = require("./QuickRegistrationActions");

class MeetupAnnouncement {
  static ACTIONS = {
    ...MeetupDetails.ACTIONS,
    ...QuickRegistrationActions.ACTIONS
  };
  //   constructor(app) {
  //     this._app = app;
  //   }

  //   async render(payload) {
  //     const { body } = payload;
  //     const { event } = body;

  //     db.Meetup.findOneByPK(meetupId)
  //     return MeetupAnnouncement.render(meetup)
  //   }


  /**
   *
   * @param {object} meetup
   * @returns {object[]} blocks
   */
  static render(meetup) {
    const blocks = [
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "Upcoming Meetup!",
          },
        },
        ...MeetupDetails.render(meetup),
        ...QuickRegistrationActions.render(meetup)
      ];
      return blocks;
  }
}

module.exports = MeetupAnnouncement;
