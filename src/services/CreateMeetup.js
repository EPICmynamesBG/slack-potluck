const _ = require("lodash");
const db = require("../models");
const DateTimeHelpers = require("../helpers/datetime");
const AnnounceMeetup = require("./AnnounceMeetup");

class CreateMeetup {
  static VIEW_ID = "meetup.create";

  static renderCreateForm(botToken, triggerId) {
    return {
      token: botToken,
      trigger_id: triggerId,
      // Pass the view_id
      view_id: CreateMeetup.VIEW_ID,
      // View payload with updated blocks
      view: {
        type: "modal",
        // View identifier
        callback_id: CreateMeetup.VIEW_ID,
        title: {
          type: "plain_text",
          text: "Schedule a Meetup",
        },
        submit: {
          type: "plain_text",
          text: "Create Meetup",
        },
        close: {
          type: "plain_text",
          text: "Cancel",
        },
        blocks: [
          {
            type: "input",
            block_id: "section.meetup.create.when",
            element: {
              type: "datetimepicker",
              action_id: "meetup.create.when",
            },
            label: {
              type: "plain_text",
              text: "When is the Meetup?",
            },
          },
          {
            type: "input",
            block_id: "section.meetup.create.where.friendly",
            label: {
              type: "plain_text",
              text: "Who's hosting?",
            },
            element: {
              type: "plain_text_input",
              action_id: "meetup.create.where.friendly",
              placeholder: {
                type: "plain_text",
                text: "George's House",
              },
            },
          },
          {
            type: "input",
            block_id: "section.meetup.create.where.address",
            label: {
              type: "plain_text",
              text: "Where?",
            },
            element: {
              type: "plain_text_input",
              multiline: true,
              action_id: "meetup.create.where.address",
              placeholder: {
                type: "plain_text",
                text: "111 Water Marq Path",
              },
            },
          },
        ],
      },
    };
  }

  static extractFormValues(viewState = {}) {
    const when = _.get(viewState, [
      "values",
      "section.meetup.create.when",
      "meetup.create.when",
      "selected_date_time",
    ]);
    const whereFriendly = _.get(viewState, [
      "values",
      "section.meetup.create.where.friendly",
      "meetup.create.where.friendly",
      "value",
    ]);
    const whereAddress = _.get(viewState, [
      "values",
      "section.meetup.create.where.address",
      "meetup.create.where.address",
      "value",
    ]);
    return {
      when,
      whereFriendly,
      whereAddress,
    };
  }

  static async execute(viewState, slackUserId, slackTeamId) {
    const formValues = this.extractFormValues(viewState);
    console.log(formValues, slackTeamId, slackUserId);
    const meetup = await db.Meetup.create({
      timestamp: DateTimeHelpers.dateFromUnix(formValues.when),
      locationAddress: formValues.whereAddress,
      locationAlias: formValues.whereFriendly,
      createdBy: slackUserId,
      slackTeamId,
    });
    return meetup;
  }

  static renderMeetupCreatedMessage(meetup) {
    return [
      {
        type: "section",
        text: {
          type: "plain_text",
          text: "Your meetup is scheduled!",
        },
      },
      ...AnnounceMeetup.renderMeetupDetails(meetup),
      {
        type: "actions",
        block_id: "meetup.created.actions",
        elements: [
          {
            action_id: AnnounceMeetup.ChannelSelectAction,
            type: "channels_select",
            placeholder: {
              type: "plain_text",
              text: "Select a Channel",
            },
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Announce It!",
            },
            style: "primary",
            value: meetup.id.toString(),
            action_id: AnnounceMeetup.SubmitAnnounceAction,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Ignore",
            },
            value: meetup.id.toString(),
            action_id: AnnounceMeetup.IgnoreAnnounceAction,
          },
        ],
      },
    ];
  }
}

module.exports = CreateMeetup;
