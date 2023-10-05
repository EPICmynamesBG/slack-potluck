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

  async _renderLoadingState({
    botToken,
    triggerId,
    meetupId,
    channel
  }) {
    return await this.client.view.open({
      token: botToken,
      trigger_id: triggerId,
      // Pass the view_id
      view_id: ViewAttendanceModal.VIEW_ID,
      // View payload with updated blocks
      view: {
        type: "modal",
        // View identifier
        callback_id: ViewAttendanceModal.VIEW_ID,
        notify_on_close: true,
        clear_on_close: true,
        private_metadata: JSON.stringify({
          meetupId,
          channel,
        }),
        title: {
          type: "plain_text",
          text: `Meetup`,
        },
        close: {
          type: "plain_text",
          text: "Close",
        },
        blocks: [
          {
            "type": "section",
            "text": {
              "type": "plain_text",
              "text": ":man-biking: Now loading..."
            }
          }
        ],
      },
    });
  }

  async render({
    botToken,
    triggerId,
    meetupId,
    channel,
    slackUserId,
    slackTeamId,
  }) {
    var res = await this._renderLoadingState({
      botToken,
      triggerId,
      meetupId,
      channel,
      slackUserId,
      slackTeamId,
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

    await this._renderFinalState({
      botToken,
      triggerId,
      meetupId,
      channel,
      meetup,
      attendeeRows,
      viewId: res.view.id
    });
  }

  async _renderFinalState({
    botToken,
    triggerId,
    meetupId,
    channel,
    meetup,
    attendeeRows,
    viewId
  }) {
    await this.client.views.update({
      token: botToken,
      // trigger_id: triggerId,
      // Pass the view_id
      view_id: viewId,
      // View payload with updated blocks
      view: {
        type: "modal",
        // View identifier
        callback_id: ViewAttendanceModal.VIEW_ID,
        notify_on_close: true,
        clear_on_close: true,
        private_metadata: JSON.stringify({
          meetupId,
          channel,
        }),
        title: {
          type: "plain_text",
          text: `${dateOnly(meetup.timestamp)} Meetup`,
        },
        close: {
          type: "plain_text",
          text: "Close",
        },
        blocks: ViewAttendanceModal.render(
          meetup.adultsRegistered,
          meetup.childrenRegistered,
          attendeeRows
        ),
      },
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
