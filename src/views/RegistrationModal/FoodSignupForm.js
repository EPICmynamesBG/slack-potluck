const _ = require('lodash');
const FoodSlot = require('../../models/constants/FoodSlot');

class FoodSignupForm {
  static ACTIONS = {
    FOOD_TYPE_SELECT: "food.signup.type",
    FOOD_DESCRIPTION: "food.signup.description",
  };

  static get FoodSlotSelectOptions() {
    return Object.values(FoodSlot).map((foodSlot) => {
      return {
        text: {
          type: "plain_text",
          text: foodSlot,
        },
        value: foodSlot,
      };
    });
  }

  static _renderFoodSelectOptions(existingFoodSignup = undefined) {
    const preSelect = existingFoodSignup
      ? existingFoodSignup.foodSlot
      : FoodSlot.UNDECIDED;
    const undecided = this.FoodSlotSelectOptions.find(
      ({ value }) => value === preSelect
    );
    return {
      action_id: this.ACTIONS.FOOD_TYPE_SELECT,
      type: "static_select",
      options: this.FoodSlotSelectOptions,
      initial_option: undecided,
    };
  }

  static _renderFoodDescription(existingFoodSignup = undefined) {
    const description = {
      type: "input",
      optional: true,
      block_id: `block.${this.ACTIONS.FOOD_DESCRIPTION}`,
      label: {
        type: "plain_text",
        text: "What will you bring?",
      },
      element: {
        type: "plain_text_input",
        action_id: this.ACTIONS.FOOD_DESCRIPTION,
        placeholder: {
          type: "plain_text",
          text: "Chicken nuggets",
        },
        max_length: 255,
        min_length: 0,
      },
    };
    const existing = _.get(existingFoodSignup, "description");
    if (existing) {
      _.set(description, ["element", "initial_value"], existing);
    }
    return description;
  }

  static getFormValues(viewState) {
    const foodType = _.get(viewState, [
      "values",
      `section.${this.ACTIONS.FOOD_TYPE_SELECT}`,
      this.ACTIONS.FOOD_TYPE_SELECT,
      "selected_option",
      "value",
    ]);
    const description = _.get(viewState, [
      "values",
      `block.${this.ACTIONS.FOOD_DESCRIPTION}`,
      this.ACTIONS.FOOD_DESCRIPTION,
      "value",
    ]);
    return {
      foodType,
      description,
    };
  }


  static render(foodSignup = undefined) {
    return [
        {
            type: "input",
            block_id: `section.${this.ACTIONS.FOOD_TYPE_SELECT}`,
            label: {
              type: "plain_text",
              text: "Dish Signup",
            },
            element: this._renderFoodSelectOptions(foodSignup),
          },
          this._renderFoodDescription(foodSignup)
    ]
  }
}

module.exports = FoodSignupForm;
