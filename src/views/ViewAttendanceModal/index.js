const db = require("../../models");
const MeetupWithRegistrationCount = require("../../models/views/MeetupWithRegistrationCount");
const { dateOnly } = require("../../helpers/datetime");
const MeetupAttendanceSection = require("../MeetupAttendanceSection");
const ViewHelper = require("../../helpers/ViewHelper");
const AttendeeRow = require('./AttendeeRow');

class ViewAttendanceModal {
  constructor(client) {
    if (!client) {
      throw new Error("Missing required client");
    }
    this.client = client;
  }

  static VIEW_ID = "meetup.attendance.view.modal";
  static ACTIONS = {};

  async render(payload) {
    const {
      meetupId,
      channel,
    } = payload;

    var viewHelper = new ViewHelper(
      this.client,
      ViewAttendanceModal.VIEW_ID,
      payload
    );
    await viewHelper.initLoading('Meetup', {
      meetupId,
      channel,
    });
    const meetup = await MeetupWithRegistrationCount.getMeetup(meetupId);
    const registrations = await db.MeetupRegistration.findAll({
      where: {
        meetupId
      },
      include: ['foodRegistration', 'meetupGroupUsers', 'includedInGroupRegistration'],
      order: [
        [db.Sequelize.literal(`
        CASE
          WHEN adult_registration_count > 0 THEN 1
          ELSE 0
        END
        `), 'ASC'],
        ['createdAt', 'ASC']
      ]
    });

    const attendeeRows = await Promise.all(
      registrations.map((registrationWithFoodSignup) => {
        const row = new AttendeeRow(this.client, registrationWithFoodSignup);
        return row.render(meetup.includeFoodSignup, meetup.createdBy);
      })
    );

    await viewHelper.update({
      title: {
        type: "plain_text",
        text: `${dateOnly(meetup.timestamp)} Meetup`,
      },
      blocks: ViewAttendanceModal.render(
        meetup.adultsRegistered,
        meetup.childrenRegistered,
        attendeeRows
      )
    }, {
      meetupId,
      channel,
    });
  }

  static _renderTotalsHeader(adultCount = 0, childCount = 0) {
    return {
      type: "section",
      fields: MeetupAttendanceSection._attendanceFields(adultCount, childCount),
    };
  }

  /**
   *
   * @param {Meetup} meetup
   * @param {AttendeeRow[]} attendeeRows
   * @returns
   */
  static render(adultsRegistered, childrenRegistered, attendeeRows = []) {
    const blocks = [
      this._renderTotalsHeader(adultsRegistered, childrenRegistered),
      { type: 'divider' }
    ];
    if (attendeeRows.length > 0) {
      const renderAttendees = ViewHelper.separateWithDivider(attendeeRows);
      blocks.push(...renderAttendees);
    } else {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "No responses",
        },
      });
    }

    return blocks;
  }
}

module.exports = ViewAttendanceModal;
