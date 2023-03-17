const _ = require('lodash');

class RegistrationForm {
  static BLOCK_ID = "registration.details.block";
  static ACTIONS = {
    REGISTER_DETAILS: "registration.attending.details.submit",
    SKIP_SIGNUP: "registration.attending.details.skip",
    ADULT_SIGNUP: "registration.attending.adult_count",
    CHILD_SIGNUP: "registration.attending.child_count",
  };


  static getFormValues(viewState) {
    const adultCount = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.ADULT_SIGNUP}`,
      this.ACTIONS.ADULT_SIGNUP,
      "value",
    ]);
    const childCount = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.CHILD_SIGNUP}`,
      this.ACTIONS.CHILD_SIGNUP,
      "value",
    ]);
    return {
      adultCount,
      childCount,
    };
  }

  // static renderModalActions(meetup) {
  //   return [
  //     {
  //       type: "actions",
  //       block_id: this.BLOCK_ID,
  //       elements: [
  //         {
  //           type: "button",
  //           text: {
  //             type: "plain_text",
  //             text: "Sign Up!",
  //           },
  //           style: "primary",
  //           value: meetup.id.toString(),
  //           action_id: this.ACTIONS.REGISTER_DETAILS,
  //         },
  //         {
  //           type: "button",
  //           text: {
  //             type: "plain_text",
  //             text: "Maybe Later",
  //           },
  //           value: meetup.id.toString(),
  //           action_id: this.ACTIONS.SKIP_SIGNUP,
  //         },
  //       ],
  //     },
  //   ];
  // }

  static render(meetupRegistration = undefined) {
    return [
        {
            type: "input",
            block_id: `section.${this.ACTIONS.ADULT_SIGNUP}`,
            element: {
              type: "number_input",
              action_id: this.ACTIONS.ADULT_SIGNUP,
              is_decimal_allowed: false,
              initial_value: meetupRegistration
                ? meetupRegistration.adultRegistrationCount.toString()
                : "1",
              min_value: "0",
              max_value: "10",
            },
            label: {
              type: "plain_text",
              text: "Adults",
            },
          },
          {
            type: "input",
            block_id: `section.${this.ACTIONS.CHILD_SIGNUP}`,
            element: {
              type: "number_input",
              action_id: this.ACTIONS.CHILD_SIGNUP,
              is_decimal_allowed: false,
              initial_value: meetupRegistration
                ? meetupRegistration.childRegistrationCount.toString()
                : "1",
              min_value: "0",
              max_value: "10",
            },
            label: {
              type: "plain_text",
              text: "Children",
            },
          }
    ]
  }
}

module.exports = RegistrationForm;
