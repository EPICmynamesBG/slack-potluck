const MeetupDetails = require("./MeetupDetails");
const MeetupDetailsWithAttendance = require("./MeetupDetailsWithAttendance");

class MeetupCancellation {
  static ACTIONS = {
    ...MeetupDetails.ACTIONS,
  };

  /**
   *
   * @param {object|MeetupDetailsWithAttendance} meetup
   * @returns {object[]} blocks
   */
  static render(meetup) {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Meetup Cancelled!",
        },
      },
      ...MeetupDetails.render(meetup),
    ];
    return blocks;
  }
}

module.exports = MeetupCancellation;
