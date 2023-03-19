const _ = require('lodash');
const { unixFromDate } = require('../../helpers/datetime');
const ViewHelper = require('../../helpers/ViewHelper');


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

  /**
   * @param {Date} [initialValue = undefined] 
   * @returns 
   */
  static _renderDateTimeInput(initialValue = undefined) {
    return ViewHelper.renderInputBlock({
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
    }, initialValue ? unixFromDate(initialValue) : undefined);
  }

  /**
   * 
   * @param {string} [initialValue = undefined] 
   */
  static _renderWhereFriendly(initialValue = undefined) {
    return ViewHelper.renderInputBlock(
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
          }
      },
      initialValue
    );
  }

  /**
   * 
   * @param {string} [existingValue = undefined] 
   */
  static _renderLocationAddress(existingValue = undefined) {
    return ViewHelper.renderInputBlock({
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
    }, existingValue);
  }

  static _renderAdditionalRemarks(initialValue = undefined) {
    return ViewHelper.renderInputBlock(
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
      initialValue
    );
  }

  /**
   * 
   * @param {boolean} [initiallySelected = undefined] 
   */
  static _renderIncludeFoodInput(initiallySelected = undefined) {
    return ViewHelper.renderInputBlock(
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
      initiallySelected
    );
  }

  static render(existingMeetup = undefined) {
    return [
      this._renderDateTimeInput(_.get(existingMeetup, 'timestamp')),
      this._renderWhereFriendly(_.get(existingMeetup, 'locationAlias')),
      this._renderLocationAddress(_.get(existingMeetup, 'locationAddress')),
      this._renderAdditionalRemarks(_.get(existingMeetup, 'additionalNotes')),
      this._renderIncludeFoodInput(_.get(existingMeetup, 'includeFoodSignup', true))
    ];
  }
}

module.exports = CreateMeetupForm;
