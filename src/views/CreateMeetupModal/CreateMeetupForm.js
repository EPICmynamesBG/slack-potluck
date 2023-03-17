const _ = require('lodash');


class CreateMeetupForm {
  static ACTIONS = {
    CREATE_MEETUP_WHEN: "meetup.create.when",
    CREATE_MEETUP_WHERE_FRIENDLY: "meetup.create.where.friendly",
    CREATE_MEETUP_WHERE_ADDRESS: "meetup.create.where.address",
    CREATE_MEETUP_INCLUDE_FOOD_SIGNUP: "meetup.create.include_food_signup",
    CREATE_MEETUP_ADDITIONAL_NOTES: "meetup.create.additional_notes",
  };

  static getFormValues(viewState = {}) {
    const when = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.CREATE_MEETUP_WHEN}`,
      this.ACTIONS.CREATE_MEETUP_WHEN,
      "selected_date_time",
    ]);
    const whereFriendly = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.CREATE_MEETUP_WHERE_FRIENDLY}`,
      this.ACTIONS.CREATE_MEETUP_WHERE_FRIENDLY,
      "value",
    ]);
    const whereAddress = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.CREATE_MEETUP_WHERE_ADDRESS}`,
      this.ACTIONS.CREATE_MEETUP_WHERE_ADDRESS,
      "value",
    ]);
    const includeFoodSignup =
      _.get(viewState, [
        "values",
        `section.${this.ACTIONS.CREATE_MEETUP_INCLUDE_FOOD_SIGNUP}`,
        this.ACTIONS.CREATE_MEETUP_INCLUDE_FOOD_SIGNUP,
        "selected_options",
        0,
        "value"
      ]) === "true";
    const additionalNotes = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.CREATE_MEETUP_ADDITIONAL_NOTES}`,
      this.ACTIONS.CREATE_MEETUP_ADDITIONAL_NOTES,
      "value",
    ]);
    return {
      additionalNotes,
      includeFoodSignup,
      when,
      whereFriendly,
      whereAddress,
    };
  }

  static render() {
    return [
      {
        type: "input",
        block_id: `section.${this.ACTIONS.CREATE_MEETUP_WHEN}`,
        element: {
          type: "datetimepicker",
          action_id: this.ACTIONS.CREATE_MEETUP_WHEN,
        },
        label: {
          type: "plain_text",
          text: "When is the Meetup?",
        },
      },
      {
        type: "input",
        optional: true,
        block_id: `section.${this.ACTIONS.CREATE_MEETUP_WHERE_FRIENDLY}`,
        label: {
          type: "plain_text",
          text: "Who's hosting?",
        },
        element: {
          type: "plain_text_input",
          action_id: this.ACTIONS.CREATE_MEETUP_WHERE_FRIENDLY,
          placeholder: {
            type: "plain_text",
            text: "George's House",
          },
        },
      },
      {
        type: "input",
        block_id: `section.${this.ACTIONS.CREATE_MEETUP_WHERE_ADDRESS}`,
        label: {
          type: "plain_text",
          text: "Where?",
        },
        element: {
          type: "plain_text_input",
          multiline: true,
          action_id: this.ACTIONS.CREATE_MEETUP_WHERE_ADDRESS,
          placeholder: {
            type: "plain_text",
            text: "111 Water Marq Path",
          },
        },
      },
      {
        type: "input",
        optional: true,
        block_id: `section.${this.ACTIONS.CREATE_MEETUP_ADDITIONAL_NOTES}`,
        label: {
          type: "plain_text",
          text: "Additional Remarks",
        },
        element: {
          type: "plain_text_input",
          multiline: true,
          action_id: this.ACTIONS.CREATE_MEETUP_ADDITIONAL_NOTES,
          placeholder: {
            type: "plain_text",
            text: "Any additional remarks?",
          },
        },
      },
      {
        type: "input",
        block_id: `section.${this.ACTIONS.CREATE_MEETUP_INCLUDE_FOOD_SIGNUP}`,
        label: {
          type: "plain_text",
          text: "People should bring food :shallow_pan_of_food:",
        },
        optional: true,
        element: {
          type: "checkboxes",
          action_id: this.ACTIONS.CREATE_MEETUP_INCLUDE_FOOD_SIGNUP,
          initial_options: [
            {
              value: "true",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Yes please! :drooling_face:",
              },
            },
          ],
          options: [
            {
              value: "true",
              text: {
                type: "plain_text",
                emoji: true,
                text: "Yes please! :drooling_face:",
              },
            },
          ],
        },
      },
    ];
  }
}

module.exports = CreateMeetupForm;
