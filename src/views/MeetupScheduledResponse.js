const _ = require('lodash');
const MeetupDetails = require("./MeetupDetails");

class MeetupScheduledResponse {
  static BLOCK_ID = "meetup.created.actions";
  static ACTIONS = {
    CHANNEL_SELECT_ACTION: "meetup.created.announce.channel_select",
    SUBMIT_ANNOUNCE_ACTION: "meetup.created.announce.submit",
    IGNORE_ANNOUNCE_ACTION: "meetup.created.announce.ignore",
  };

  static getFormValues(state) {
    const channel =
      _.get(state, [
        "values",
        this.BLOCK_ID,
        this.ACTIONS.CHANNEL_SELECT_ACTION,
        "selected_channel",
      ]) ||
      _.get(state, [
        "values",
        this.BLOCK_ID,
        this.ACTIONS.CHANNEL_SELECT_ACTION,
        "selected_conversation",
      ]);
    return {
      channel,
    };
  }

  static _renderChannelSelectBlock() {
    // if (process.env.DEBUG) {
    //   return {
    //     action_id: this.ACTIONS.CHANNEL_SELECT_ACTION,
    //     type: "conversations_select",
    //     placeholder: {
    //       type: "plain_text",
    //       text: "Select a Channel",
    //     },
    //   };
    // }
    return {
      action_id: this.ACTIONS.CHANNEL_SELECT_ACTION,
      type: "conversations_select",
      placeholder: {
        type: "plain_text",
        text: "Select a Channel",
      },
    };
    // return {
    //   action_id: this.ACTIONS.CHANNEL_SELECT_ACTION,
    //   type: "channels_select",
    //   placeholder: {
    //     type: "plain_text",
    //     text: "Select a Channel",
    //   },
    // };
  }

  static render(meetup) {
    return [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "Meetup scheduled!",
        },
      },
      ...MeetupDetails.render(meetup),
      {
        type: "actions",
        block_id: this.BLOCK_ID,
        elements: [
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
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Ignore",
            },
            value: meetup.id.toString(),
            action_id: this.ACTIONS.IGNORE_ANNOUNCE_ACTION,
          },
        ],
      },
    ];
  }
}

module.exports = MeetupScheduledResponse;
