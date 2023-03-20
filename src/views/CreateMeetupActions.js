class CreateMeetupActions {
  static BLOCK_ID = "home.meetup.create";
  static ACTIONS = {
    CREATE_MEETUP: "meetup.create", // hardcoded in Slack config; do not change
  };

  static render() {
    return [
      {
        type: "actions",
        block_id: this.BLOCK_ID,
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Create a Meetup",
            },
            style: "primary",
            action_id: this.ACTIONS.CREATE_MEETUP,
          },
        ],
      },
    ];
  }
}

module.exports = CreateMeetupActions;
