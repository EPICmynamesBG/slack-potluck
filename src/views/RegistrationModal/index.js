const _ = require('lodash');
const db = require("../../models");
const RegistrationForm = require("./RegistrationForm");
const FoodSignupForm = require('./FoodSignupForm');
const SignupIncludeUsersForm = require('./SignupIncludeUsersForm');
const LimitedRegistrationModal = require('../LimitedRegistrationModal');
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
        include: ["foodRegistration", "meetupGroupUsers"]
      });
    const existingFoodSignup = _.get(existingRegistration, 'foodRegistration');
    const meetup = await db.Meetup.findByPk(meetupId);
    const includedInGroupRegistration = await db.MeetupRegistrationGroupUsers.FindInclusionRegistration({
      meetupId,
      slackTeamId,
      forUser: slackUserId
    });

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
        blocks: includedInGroupRegistration ?
          LimitedRegistrationModal.renderBlocks(
            meetup,
            includedInGroupRegistration,
            existingRegistration,
            existingFoodSignup
          ) : 
          RegistrationModal.renderBlocks(
            meetup,
            existingRegistration,
            existingFoodSignup,
            includedInGroupRegistration
          ),
      },
    };
  }

  static _renderBlocks(meetup, existingRegistration, existingFoodSignup) {
    const blocks = [
      ...RegistrationForm.render(existingRegistration),
    ];
    if (meetup.includeFoodSignup) {
      blocks.push(...FoodSignupForm.render(existingFoodSignup));
    }
    blocks.push(...SignupIncludeUsersForm.render(existingRegistration.meetupGroupUsers));
    return blocks;
  }

  /**
   * 
   * @param {Meetup} meetup 
   * @param {MeetupRegistration | undefined} existingRegistration 
   * @param {MeetupRegistrationFood | undefined} existingFoodSignup 
   * @returns 
   */
  static renderBlocks(meetup, existingRegistration, existingFoodSignup, includedInGroupRegistration) {
    var blocks = !!includedInGroupRegistration ?
      LimitedRegistrationModal.renderBlocks(
        meetup,
        includedInGroupRegistration,
        existingRegistration,
        existingFoodSignup
      ) :
      this._renderBlocks(meetup, existingRegistration, existingFoodSignup);
    
    // Move notes to last, always
    var notesArr = _.remove(blocks, block => block.block_id === `section.${RegistrationForm.ACTIONS.SIGNUP_NOTES}`);
    return [...blocks, ...notesArr];
  }
}

module.exports = RegistrationModal;
