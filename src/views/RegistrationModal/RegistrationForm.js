const _ = require('lodash');

class RegistrationForm {
  static BLOCK_ID = "registration.details.block";
  static ACTIONS = {
    REGISTER_DETAILS: "registration.attending.details.submit",
    SKIP_SIGNUP: "registration.attending.details.skip",
    ADULT_SIGNUP: "registration.attending.adult_count",
    CHILD_SIGNUP: "registration.attending.child_count",
    SIGNUP_NOTES: "registration.attending.notes"
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
    const notes = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.SIGNUP_NOTES}`,
      this.ACTIONS.SIGNUP_NOTES,
      "value",
    ]);
    return {
      adultCount,
      childCount,
      notes
    };
  }

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
          },
          {
            type: 'input',
            block_id: `section.${this.ACTIONS.SIGNUP_NOTES}`,
            optional: true,
            element: {
              type: "plain_text_input",
              multiline: true,
              action_id: this.ACTIONS.SIGNUP_NOTES,
              placeholder: {
                type: "plain_text",
                text: "ie: allergies"
              }
            },
            label: {
              type: "plain_text",
              text: "Notes",
              emoji: true
            }
          }
    ]
  }
}

module.exports = RegistrationForm;
