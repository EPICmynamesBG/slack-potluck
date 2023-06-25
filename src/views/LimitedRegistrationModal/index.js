// const _ = require('lodash');
// const db = require("../../models");
// const RegistrationForm = require("./RegistrationForm");
const LimitedRegistrationForm = require('./LimitedRegistrationForm');
const FoodSignupForm = require('../RegistrationModal/FoodSignupForm');
// const SignupIncludeUsersForm = require('../RegistrationModal/SignupIncludeUsersForm');

/**
 * a fragment class that is rendered explicilty from RegistrationModal
 */
class LimitedRegistrationModal {
  /**
   * 
   * @param {Meetup} meetup 
   * @param {MeetupRegistrationGroupUser} includedWithinOtherUserRegistration 
   * @param {MeetupRegistration | undefined} existingRegistration 
   * @param {MeetupRegistrationFood | undefined} existingFoodSignup 
   * @returns 
   */
  static renderBlocks(meetup, includedWithinOtherUserRegistration, existingRegistration = undefined, existingFoodSignup = undefined) {
    const blocks = [
      ...LimitedRegistrationForm.render(includedWithinOtherUserRegistration, existingRegistration),
    ];
    if (meetup.includeFoodSignup) {
        blocks.push(...FoodSignupForm.render(existingFoodSignup));
    }
  
    return blocks;
  }
}

module.exports = LimitedRegistrationModal;
