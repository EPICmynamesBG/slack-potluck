const _ = require('lodash');
const DateTimeHelpers = require("../helpers/datetime");
const ViewHelper = require("../helpers/ViewHelper");
const MeetupWithRegistrationCount = require("../models/views/MeetupWithRegistrationCount");
const MeetupDetailsWithAttendance = require("./MeetupDetailsWithAttendance");

class Home {
  constructor(app) {
    this._app = app;
  }

  async render(payload) {
    const { body } = payload;
    const { event } = body;
    const meetups = await MeetupWithRegistrationCount.getUpcomingForTeam(
      body.team_id
    );

    await this._app.client.views.publish({
      user_id: event.user,
      team_id: body.team_id,
      view: {
        type: "home",
        blocks: Home.render(meetups, event.user),
      },
    });
  }

  /**
   *
   * @param {MeetupWithRegistrationCount[]} meetups
   * @returns
   */
  static render(meetups, renderingForSlackUserId = undefined) {
    const meetupBlocks = ViewHelper.separateWithDivider(meetups.map(meetup => MeetupDetailsWithAttendance.render(meetup, renderingForSlackUserId)));
    
    return [
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
      ...meetupBlocks,
      {
        type: 'divider'
      }
    ];
  }
}

module.exports = Home;
