const AnnounceMeetupActions = require("./AnnounceMeetupActions");
const { humanReadable } = require('../helpers/datetime');

class MeetupManagementActions {
  static BLOCK_ID = "meetup.manage.actions";
  static ACTIONS = {
    CANCEL_MEETUP: "meetup.cancel",
    MANAGE_MEETUP_ACTION: "meetup.manage.modal.trigger",
  };

  static _deleteConfirmation(meetup) {
    return {
      title: {
        type: 'plain_text',
        text: 'Cancel Meetup'
      },
      text: {
        type: 'mrkdwn',
        text: `Are you sure want to cancel the ${humanReadable(meetup.timestamp)} Meetup? This will update all existing announcements.`
      },
      confirm: {
        type: 'plain_text',
        text: 'Cancel Meetup'
      },
      deny: {
        type: 'plain_text',
        text: 'Abort'
      },
      style: 'danger'
    };
  }

  static render(meetup, forSlackUserId = undefined) {
    if (!meetup.isOrganizer(forSlackUserId)) {
      return [];
    }
    const additionalElements = [
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Edit",
        },
        value: meetup.id.toString(),
        action_id: this.ACTIONS.MANAGE_MEETUP_ACTION,
      },
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Cancel",
        },
        style: "danger",
        value: meetup.id.toString(),
        confirm: this._deleteConfirmation(meetup),
        action_id: this.ACTIONS.CANCEL_MEETUP,
      }
    ];
    return AnnounceMeetupActions.render(meetup, false, additionalElements);
  }
}

module.exports = MeetupManagementActions;
