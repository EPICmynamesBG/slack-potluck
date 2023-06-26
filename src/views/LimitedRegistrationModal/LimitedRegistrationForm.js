const _ = require('lodash');
const RegistrationForm = require('../RegistrationModal/RegistrationForm');

class LimitedRegistrationForm extends RegistrationForm {
  static BLOCK_ID = RegistrationForm.BLOCK_ID;
  static ACTIONS = RegistrationForm.ACTIONS;

  static getFormValues = RegistrationForm.getFormValues;

  /**
   * 
   * @param {MeetupRegistrationGroupUser} includedWithinOtherUserRegistration 
   */
  static _renderIncludedInOtherSignupHeader(includedWithinOtherUserRegistration) {
    return {
        type: "section",
        text: {
            type: "mrkdwn",
            text: `_<@${includedWithinOtherUserRegistration.createdBy}> has included you in their signup! Because of this, your signup options are limited._`
        }
    };
  }


  /**
   * 
   * @param {*} meetupRegistration 
   * @param {MeetupRegistrationGroupUser | undefined} includedWithinOtherUserRegistration 
   * @returns 
   */
  static render(includedInGroupRegistration, meetupRegistration = undefined) {
    return [
        this._renderIncludedInOtherSignupHeader(includedInGroupRegistration),
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
              max_value: "1",
            },
            label: {
              type: "plain_text",
              text: "Adults",
            }
          }
    ]
  }
}

module.exports = LimitedRegistrationForm;
