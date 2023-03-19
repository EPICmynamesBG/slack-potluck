const db = require("../../models");
const ManageMeetupModal = require(".");
const CreateMeetupForm = require("../CreateMeetupModal/CreateMeetupForm");

class ManageMeetupModalPostCancellation extends ManageMeetupModal {
  async render({
    botToken,
    triggerId,
    meetup,
    channel,
    hash,
    slackUserId,
    slackTeamId,
  }) {
    const meetupId = meetup.id;
    await this._app.client.views.update({
      token: botToken,
      trigger_id: triggerId,
      // Pass the view_id
      view_id: ManageMeetupModal.VIEW_ID,
      hash,
      // View payload with updated blocks
      view: {
        type: "modal",
        // View identifier
        callback_id: ManageMeetupModal.VIEW_ID,
        notify_on_close: true,
        clear_on_close: true,
        private_metadata: JSON.stringify({
          meetupId,
          channel,
        }),
        title: {
          type: "plain_text",
          text: `Cancelled Meetup`,
        },
        submit: {
          type: "plain_text",
          text: "Submit (Unavailable)"
        },
        close: {
          type: "plain_text",
          text: "Close",
        },
        blocks: ManageMeetupModalPostCancellation.render(meetup),
      },
    });
  }

  static renderView({
    botToken,
    triggerId,
    meetup,
    channel,
    hash,
    slackUserId,
    slackTeamId,
  }) {
    const meetupId = meetup.id;
      return {
        type: "modal",
        // View identifier
        callback_id: ManageMeetupModal.VIEW_ID,
        notify_on_close: true,
        clear_on_close: true,
        private_metadata: JSON.stringify({
          meetupId,
          channel,
        }),
        title: {
          type: "plain_text",
          text: `Cancelled Meetup`,
        },
        submit: {
          type: "plain_text",
          text: "Submit (Unavailable)"
        },
        close: {
          type: "plain_text",
          text: "Close",
        },
        blocks: ManageMeetupModalPostCancellation.render(meetup),
      };
  }

  static render(meetup) {
    return [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "This meetup has been cancelled. Please close this screen.",
        },
      },
      // ...CreateMeetupForm.render(meetup),
    ];
  }
}

module.exports = ManageMeetupModalPostCancellation;
