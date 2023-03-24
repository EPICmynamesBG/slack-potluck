const _ = require("lodash");

class AnnounceMeetupActions {
  static BLOCK_ID = "meetup.created.actions";
  static ACTIONS = {
    CHANNEL_SELECT_ACTION: "meetup.created.announce.channel_select",
    SUBMIT_ANNOUNCE_ACTION: "meetup.created.announce.submit",
    IGNORE_ANNOUNCE_ACTION: "meetup.created.announce.ignore",
  };

  static getBlockId(meetupId) {
    if (!meetupId) {
      return this.BLOCK_ID;
    }
    return `${this.BLOCK_ID}.${meetupId}`;
  }

  static getFormValues(state, forMeetupId = undefined) {
    const channel =
      _.get(state, [
        "values",
        this.getBlockId(forMeetupId),
        this.ACTIONS.CHANNEL_SELECT_ACTION,
        "selected_channel",
      ]) ||
      _.get(state, [
        "values",
        this.getBlockId(forMeetupId),
        this.ACTIONS.CHANNEL_SELECT_ACTION,
        "selected_conversation",
      ]);
    return {
      channel,
    };
  }

  static _renderChannelSelectBlock() {
    if (process.env.NODE_ENV === 'development') {
      return {
        action_id: this.ACTIONS.CHANNEL_SELECT_ACTION,
        type: "conversations_select",
        placeholder: {
          type: "plain_text",
          text: "Select a Channel",
        },
      };
    }
    return {
      action_id: this.ACTIONS.CHANNEL_SELECT_ACTION,
      type: "channels_select",
      placeholder: {
        type: "plain_text",
        text: "Select a Channel",
      },
    };
  }

  static render(meetup, includeIgnore = true, additionalElements = []) {
    const elements = [
      this._renderChannelSelectBlock(),
      {
        type: "button",
        text: {
          type: "plain_text",
          text: "Announce It!",
        },
        style: "primary",
        value: meetup.id.toString(),
        action_id: this.ACTIONS.SUBMIT_ANNOUNCE_ACTION,
      },
    ];
    if (includeIgnore) {
      elements.push({
        type: "button",
        text: {
          type: "plain_text",
          text: "Ignore",
        },
        value: meetup.id.toString(),
        action_id: this.ACTIONS.IGNORE_ANNOUNCE_ACTION,
      });
    }
    elements.push(...additionalElements);
    return [
      {
        type: "actions",
        block_id: this.getBlockId(_.get(meetup, 'id')),
        elements,
      },
    ];
  }
}

module.exports = AnnounceMeetupActions;
