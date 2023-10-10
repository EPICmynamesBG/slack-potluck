const _ = require('lodash');
const db = require("../../models");
const RegistrationForm = require("./RegistrationForm");
const FoodSignupForm = require('./FoodSignupForm');
const SignupIncludeUsersForm = require('./SignupIncludeUsersForm');
const LimitedRegistrationModal = require('../LimitedRegistrationModal');

class RegistrationModal {
  constructor(client) {
    if (!client) {
      throw new Error("Missing required client");
    }
    this.client = client;
  }

  static VIEW_ID = "meetup.registration.modal";
  static ACTIONS = {
    ...RegistrationForm.ACTIONS,
    ...FoodSignupForm.ACTIONS
  };

  async render(payload) {
    const {
      meetupId,
      channel,
    } = payload;
  
    var viewHelper = new ViewHelper(
      this.client,
      RegistrationModal.VIEW_ID,
      payload
    );
    await viewHelper.initLoading('Signup', {
      meetupId,
      channel,
    });


    var renderView = await this._render({

    });
    try  {
      return await viewHelper.update(renderView, {
        meetupId,
        channel,
      });
    } catch (e) {
      await viewHelper.close();
      throw e;
    }
  }

  async _render({ meetupId, slackUserId, slackTeamId }) {
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
    const includedInGroupRegistration = existingRegistration ? await db.MeetupRegistrationGroupUser.findOne({
      where: {
        slackTeamId,
        groupedSlackUserId: slackUserId,
        groupedUserRegistrationId: existingRegistration.id  
      }
    }) : undefined;

    return {
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
      blocks: RegistrationModal.renderBlocks(
          meetup,
          existingRegistration,
          existingFoodSignup,
          includedInGroupRegistration
      )
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
