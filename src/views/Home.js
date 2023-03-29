const _ = require("lodash");
const DateTimeHelpers = require("../helpers/datetime");
const ViewHelper = require("../helpers/ViewHelper");
const MeetupWithRegistrationCount = require("../models/views/MeetupWithRegistrationCount");
const CreateMeetupActions = require("./CreateMeetupActions");
const MeetupDetailsWithAttendance = require("./MeetupDetailsWithAttendance");

class Home {
  constructor(client) {
    this._client = client;
  }

  async render(slackUserContext) {
    const meetups = await MeetupWithRegistrationCount.getUpcomingForTeam(
      slackUserContext.team_id
    );

    const payload = {
      user_id: slackUserContext.user_id,
      team_id: slackUserContext.team_id,
      view: {
        type: "home",
        blocks: Home.render(meetups, slackUserContext),
      },
    };
    await this._client.views.publish(payload);
  }

  /**
   *
   * @param {MeetupWithRegistrationCount[]} meetups
   * @param {object} [slackUserContext = {}]
   * @returns
   */
  static render(meetups, slackUserContext = {}) {
    const meetupBlocks = ViewHelper.separateWithDivider(
      meetups.map((meetup) =>
        MeetupDetailsWithAttendance.render(meetup, slackUserContext)
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
