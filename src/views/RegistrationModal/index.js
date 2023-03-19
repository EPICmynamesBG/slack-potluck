const _ = require('lodash');
const db = require("../../models");
const RegistrationForm = require("./RegistrationForm");
const FoodSignupForm = require('./FoodSignupForm');

class RegistrationModal {
  static VIEW_ID = "meetup.registration.modal";
  static ACTIONS = {
    ...RegistrationForm.ACTIONS,
    ...FoodSignupForm.ACTIONS
  };

  async render({ botToken, triggerId, meetupId, channel, slackUserId, slackTeamId }) {
    const existingRegistration = await db.MeetupRegistration.findOne({
        where: {
          createdBy: slackUserId,
          slackTeamId,
          meetupId,
        },
        include: "foodRegistration",
      });
    const existingFoodSignup = _.get(existingRegistration, 'foodRegistration');
    const meetup = await db.Meetup.findByPk(meetupId);

    return {
      token: botToken,
      trigger_id: triggerId,
      // Pass the view_id
      view_id: RegistrationModal.VIEW_ID,
      // View payload with updated blocks
      view: {
        type: "modal",
        // View identifier
        callback_id: RegistrationModal.VIEW_ID,
        notify_on_close: true,
        clear_on_close: true,
        private_metadata: JSON.stringify({
          meetupId,
          channel,
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
        blocks: RegistrationModal.renderBlocks(meetup, existingRegistration, existingFoodSignup),
      },
    };
  }

  static renderBlocks(meetup, existingRegistration, existingFoodSignup) {
    const blocks = [
      ...RegistrationForm.render(existingRegistration),
    ];
    if (meetup.includeFoodSignup) {
      blocks.push(...FoodSignupForm.render(existingFoodSignup));
    }
    return blocks;
  }
}

module.exports = RegistrationModal;