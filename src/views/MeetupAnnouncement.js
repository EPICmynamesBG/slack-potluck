const MeetupAttendanceSection = require("./MeetupAttendanceSection");
const MeetupDetails = require("./MeetupDetails");
const MeetupDetailsWithAttendance = require("./MeetupDetailsWithAttendance");
const QuickRegistrationActions = require("./QuickRegistrationActions");

class MeetupAnnouncement {
  static ACTIONS = {
    ...MeetupDetails.ACTIONS,
    ...QuickRegistrationActions.ACTIONS,
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
   * @param {object|MeetupDetailsWithAttendance} meetup
   * @param {boolean} [showAttendance = false]
   * @returns {object[]} blocks
   */
  static render(meetup, showAttendance = false) {
    const blocks = [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: "Upcoming Meetup!",
        },
      },
      ...MeetupDetails.render(meetup),
    ];
    if (showAttendance) {
      blocks.push(...MeetupAttendanceSection.render(meetup));
    }
    blocks.push(...QuickRegistrationActions.render(meetup));
    return blocks;
  }
}

module.exports = MeetupAnnouncement;
