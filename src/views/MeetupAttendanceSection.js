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

  static _attendanceFields(adultCount = 0, childCount = 0) {
    return [
      {
        type: "mrkdwn",
        text: `*Adults* ${adultCount || 0}`,
      },
      {
        type: "mrkdwn",
        text: `*Children* ${childCount || 0}`,
      }
    ];
  }

  static _attendanceSection(meetupId, adultCount = 0, childCount = 0) {
    return {
      type: "section",
      block_id: `${this.ATTENDANCE_BLOCK_ID}.${meetupId}.${unixFromDate(new Date())}`,
      fields: this._attendanceFields(adultCount, childCount),
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
