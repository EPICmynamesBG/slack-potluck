const _ = require("lodash");
const FoodSlot = require("../models/constants/FoodSlot");
const db = require("../models");
const ErrorAssistant = require("../helpers/ErrorAssistant");
const MeetupRegistration = require("./MeetupRegistration");

class FoodSignup {
  static ACTIONS = {
    BLOCK: "food.signup.block",
    FOOD_TYPE_SELECT: "food.signup.type",
    FOOD_DESCRIPTION: "food.signup.description",
    SIGNUP: "food.signup.attending.trigger",
    NOT_ATTENDING: "food.signup.not_attenting",
  };

  static VIEW_ID = "food.signup.view";

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

  static renderFoodSelectOptions(existingFoodSignup = undefined) {
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

  static renderFoodDescription(existingFoodSignup = undefined) {
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
        _.set(description, ['element', 'initial_value'], existing);
    }
    return description;
  }

  static renderSignupViewActions(meetup) {
    return [
      {
        type: "actions",
        block_id: this.ACTIONS.BLOCK,
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

  static renderSignupActions(meetup) {
    return [
      {
        type: "actions",
        block_id: this.ACTIONS.BLOCK,
        elements: [
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Sign Up!",
            },
            style: "primary",
            value: meetup.id.toString(),
            action_id: this.ACTIONS.SIGNUP,
          },
          {
            type: "button",
            text: {
              type: "plain_text",
              text: "Maybe Later",
            },
            value: meetup.id.toString(),
            action_id: this.ACTIONS.NOT_ATTENDING,
          },
        ],
      },
    ];
  }

  static async renderSignupModal(payload) {
    const { action, context, body } = payload;
    const botToken = context.botToken;
    const triggerId = body.trigger_id;
    const meetupId = action.value;

    let existingRegistration;
    let existingFoodSignup;
    try {
      existingRegistration = await db.MeetupRegistration.findOne({
        where: {
            createdBy: body.user.id,
            slackTeamId: body.user.team_id,
            meetupId,
        },
        include: 'foodRegistration'
      });
      existingFoodSignup = existingRegistration.foodRegistration;
    } catch (e) {
      console.error(e);
    }

    return {
      token: botToken,
      trigger_id: triggerId,
      // Pass the view_id
      view_id: this.VIEW_ID,
      // View payload with updated blocks
      view: {
        type: "modal",
        // View identifier
        callback_id: this.VIEW_ID,
        notify_on_close: true,
        clear_on_close: true,
        private_metadata: JSON.stringify({
          meetupId,
          channel: body.channel.id,
        }),
        title: {
          type: "plain_text",
          text: "Event signup",
        },
        submit: {
          type: "plain_text",
          text: "Signup",
        },
        close: {
          type: "plain_text",
          text: "Ask me Later",
        },
        blocks: [
          {
            type: "input",
            block_id: `section.${MeetupRegistration.ACTIONS.ADULT_SIGNUP}`,
            element: {
              type: "number_input",
              action_id: MeetupRegistration.ACTIONS.ADULT_SIGNUP,
              is_decimal_allowed: false,
              initial_value: existingRegistration
                ? existingRegistration.adultRegistrationCount.toString()
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
            block_id: `section.${MeetupRegistration.ACTIONS.CHILD_SIGNUP}`,
            element: {
              type: "number_input",
              action_id: MeetupRegistration.ACTIONS.CHILD_SIGNUP,
              is_decimal_allowed: false,
              initial_value: existingRegistration
                ? existingRegistration.childRegistrationCount.toString()
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
            type: "input",
            block_id: `section.${this.ACTIONS.FOOD_TYPE_SELECT}`,
            label: {
              type: "plain_text",
              text: "Dish Signup",
            },
            element: this.renderFoodSelectOptions(existingFoodSignup),
          },
          this.renderFoodDescription(existingFoodSignup),
        ],
      },
    };
  }

  static async _createOrUpdateRegistration(
    errorHelper,
    { meetupId, slackUserId, slackTeamId, foodType, description }
  ) {
    let registration;
    try {
      registration = await db.MeetupRegistration.findOne({
        where: {
          meetupId,
          createdBy: slackUserId,
          slackTeamId,
        },
        include: "foodRegistration",
      });
    } catch (e) {
      await errorHelper.handleError(e, "Meetup registration not found");
      return;
    }
    try {
      if (registration.foodRegistration) {
        registration.foodRegistration.foodSlot = foodType;
        registration.foodRegistration.description = description;
        registration.foodRegistration.updatedAt = new Date();
        await registration.foodRegistration.save();
        return registration.foodRegistration;
      }
      return await db.MeetupRegistrationFood.create({
        meetupRegistrationId: registration.id,
        createdBy: slackUserId,
        slackTeamId,
        foodSlot: foodType,
        description,
      });
    } catch (e) {
      await errorHelper.handleError(e, "Failed to store food response");
      return;
    }
  }

  static getSignupFormValues(viewState) {
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

  static async recordResponse(app, payload) {
    const { body, view } = payload;
    const meta = JSON.parse(_.get(view, "private_metadata", "{}"));
    const { meetupId, channel = body.user.id } = meta;
    const { foodType, description } = this.getSignupFormValues(view.state);

    await this._createOrUpdateRegistration(new ErrorAssistant(app, payload), {
      meetupId,
      slackTeamId: body.user.team_id,
      slackUserId: body.user.id,
      foodType,
      description,
    });
  }
}

module.exports = FoodSignup;
