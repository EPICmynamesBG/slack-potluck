const { unixFromDate } = require("../helpers/datetime");

class MeetupAttendanceSection {
  static ATTENDANCE_BLOCK_ID = "attendance";
  static ACTIONS = {
    VIEW_ATTENDANCE: "view.attendance.trigger",
  };

  static _viewAttendanceButton(meetupId) {
    return {
      action_id: this.ACTIONS.VIEW_ATTENDANCE,
      type: "button",
      text: {
        type: "plain_text",
        text: "Attendees",
      },
      value: meetupId.toString(),
      accessibility_label: "View Attendees",
    };
  }

  static _attendanceSection(meetupId, adultCount = 0, childCount = 0) {
    return {
      type: "section",
      block_id: `${this.ATTENDANCE_BLOCK_ID}.${meetupId}.${unixFromDate(new Date())}`,
      fields: [
        {
          type: "mrkdwn",
          text: "*Adults*",
        },
        {
          type: "mrkdwn",
          text: "*Children*",
        },
        {
          type: "plain_text",
          text: `${adultCount || 0}`,
        },
        {
          type: "plain_text",
          text: `${childCount || 0}`,
        },
      ],
      accessory: this._viewAttendanceButton(meetupId),
    };
  }

  /**
   * @param {MeetupWithRegistrationCount} meetup
   */

  static render(meetup) {
    return [
      this._attendanceSection(
        meetup.id,
        meetup.adultsRegistered,
        meetup.childrenRegistered
      ),
    ];
  }
}

module.exports = MeetupAttendanceSection;
