const MeetupAttendanceSection = require("./MeetupAttendanceSection");
const MeetupDetails = require("./MeetupDetails");
const MeetupDetailsWithAttendance = require("./MeetupDetailsWithAttendance");
const QuickRegistrationActions = require("./QuickRegistrationActions");

class MeetupAnnouncement {
  static ACTIONS = {
    ...MeetupDetails.ACTIONS,
    ...QuickRegistrationActions.ACTIONS,
  };

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
