const _ = require('lodash');
const FoodSlot = require('../../models/constants/FoodSlot');

class SignupIncludeUsersForm {
  static ACTIONS = {
    SIGNUP_INCLUDE_USERS_INPUT: "signup.include.users.input"
  };

  static _renderMultiUserSelectOptions(existingIncludedUsers = []) {
    var ids = existingIncludedUsers.map(x => x.groupedSlackUserId);
    return {
      action_id: this.ACTIONS.FOOD_TYPE_SELECT,
      type: "multi_users_select",
      initial_users: ids
    };
  }

  static getFormValues(viewState) {
    const includedUsers = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.SIGNUP_INCLUDE_USERS_INPUT}`,
      this.ACTIONS.SIGNUP_INCLUDE_USERS_INPUT,
      "selected_users",
      "value",
    ]);
    return {
      includedUsers
    };
  }

  /**
   * 
   * @param {MeetupRegistrationGroupUser[]} [includedUsers = []] 
   * @returns 
   */
  static render(includedUsers = []) {
    return [
        {
            type: "input",
            block_id: `section.${this.ACTIONS.FOOD_TYPE_SELECT}`,
            optional: true,
            label: {
              type: "plain_text",
              text: "Include other users in this Signup",
            },
            element: this._renderMultiUserSelectOptions(includedUsers),
          }
    ]
  }
}

module.exports = SignupIncludeUsersForm;
