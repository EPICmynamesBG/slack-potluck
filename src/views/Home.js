const _ = require("lodash");
const DateTimeHelpers = require("../helpers/datetime");
const ViewHelper = require("../helpers/ViewHelper");
const MeetupWithRegistrationCount = require("../models/views/MeetupWithRegistrationCount");
const CreateMeetupActions = require("./CreateMeetupActions");
const MeetupDetailsWithAttendance = require("./MeetupDetailsWithAttendance");

class Home {
  constructor(app) {
    this._app = app;
  }

  async render(slackTeamId, slackUserId) {
    const meetups = await MeetupWithRegistrationCount.getUpcomingForTeam(
      slackTeamId
    );

    const payload = {
      user_id: slackUserId,
      team_id: slackTeamId,
      view: {
        type: "home",
        blocks: Home.render(meetups, slackUserId),
      },
    };
    await this._app.client.views.publish(payload);
  }

  /**
   *
   * @param {MeetupWithRegistrationCount[]} meetups
   * @returns
   */
  static render(meetups, renderingForSlackUserId = undefined) {
    const meetupBlocks = ViewHelper.separateWithDivider(
      meetups.map((meetup) =>
        MeetupDetailsWithAttendance.render(meetup, renderingForSlackUserId)
      ),
      true
    );

    const blocks = [
      ...CreateMeetupActions.render(),
      {
        type: "header",
        block_id: DateTimeHelpers.unixFromDate(new Date()).toString(),
        text: {
          type: "plain_text",
          text: "Upcoming Team Meetups",
        },
      },
      {
        type: "divider",
      },
    ];
    if (meetupBlocks.length === 0) {
      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: "No meetups are scheduled at this time",
        },
      });
    } else {
      blocks.push(...meetupBlocks);
    }
    return blocks;
  }
}

module.exports = Home;
