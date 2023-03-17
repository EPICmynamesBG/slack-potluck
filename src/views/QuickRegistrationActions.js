class QuickRegistrationActions {
  static BLOCK_ID = "registration.block";
  static ACTIONS = {
    SIGNUP: "registration.attending.trigger",
    NOT_ATTENDING: "registration.not_attenting",
  };

  static render(meetup) {
    return [
      {
        type: "actions",
        block_id: this.BLOCK_ID,
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "I'm going!",
            },
            style: "primary",
            value: meetup.id.toString(),
            action_id: this.ACTIONS.SIGNUP,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Can't make it :disappointed:",
            },
            value: meetup.id.toString(),
            action_id: this.ACTIONS.NOT_ATTENDING,
          },
        ],
      },
    ];
  }
}

module.exports = QuickRegistrationActions;
