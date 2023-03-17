const db = require("../../models");
const CreateMeetupForm = require("./CreateMeetupForm");

class CreateMeetupModal {
  static VIEW_ID = "meetup.create.modal";
  static ACTIONS = {
    ...CreateMeetupForm.ACTIONS
  };

  async render({ botToken, triggerId }) {
    return {
        token: botToken,
        trigger_id: triggerId,
        // Pass the view_id
        view_id: CreateMeetupModal.VIEW_ID,
        // View payload with updated blocks
        view: {
          type: "modal",
          // View identifier
          callback_id: CreateMeetupModal.VIEW_ID,
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
          blocks: CreateMeetupForm.render(),
        },
      };
  }
}

module.exports = CreateMeetupModal;
