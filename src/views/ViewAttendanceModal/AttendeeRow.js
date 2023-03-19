const _ = require('lodash');
const FoodSlot = require("../../models/constants/FoodSlot");
const MeetupAttendanceSection = require("../MeetupAttendanceSection");

class AttendeeRow {
  constructor(app, registrationWithFoodSignup) {
    this._app = app;
    this.registrationWithFoodSignup = registrationWithFoodSignup;
    this._userInfo = undefined;
  }

  static FoodSlotIconMap = {
    [FoodSlot.MAIN_DISH]: ':shallow_pan_of_food:',
    [FoodSlot.SIDE_DISH]: ':corn:',
    [FoodSlot.BEVERAGES]: ':sake:',
    [FoodSlot.BEVERAGES]: ':cupcake:',
    [FoodSlot.UNDECIDED]: ':question:',
  }

  static ResponseIndicatesAttending(meetupRegistration) {
    return (
      meetupRegistration.adultRegistrationCount +
        meetupRegistration.childRegistrationCount >
      0
    );
  }

  async getUserInfo() {
    if (this._userInfo) {
      return this._userInfo;
    }

    try {
      const { user } = await this._app.client.users.info({
        user: this.registrationWithFoodSignup.createdBy,
      });
      this._userInfo = user;
    } catch (e) {
      console.error(e);
    }
    return this._userInfo;
  }

  static _renderUserInfo(slackUserId, userInfo = undefined) {
    if (userInfo) {
      return [
        {
          type: "image",
          image_url: userInfo.profile.image_192,
          alt_text: userInfo.name,
        },
        {
          type: "mrkdwn",
          text: `@${userInfo.name}`,
        },
      ];
    }
    return [
      {
        type: "mrkdwn",
        text: `:confused:`,
      },
      {
        type: "mrkdwn",
        text: `*${slackUserId}*`,
      },
    ];
  }

  static _renderFoodSignup(foodRegistration = undefined) {
    const slot = foodRegistration ? foodRegistration.foodSlot : FoodSlot.UNDECIDED;
    const description = _.get(foodRegistration, 'description');
    const icon = this.FoodSlotIconMap[slot];
    let message = `${icon} ${slot}`;
    if (description) {
        message += ` _${description}_`;
    }
    return [
        {
            type: 'mrkdwn',
            text: message
        }
    ];
  }

  async render(includeFoodSignups = false) {
    const userInfo = await this.getUserInfo();
    const isGoing = AttendeeRow.ResponseIndicatesAttending(
      this.registrationWithFoodSignup
    );
    const slackUserId = this.registrationWithFoodSignup.createdBy;
    const userElements = [
      {
        type: "mrkdwn",
        text: isGoing ? ":white_check_mark:" : ":x:",
      },
      ...AttendeeRow._renderUserInfo(slackUserId, userInfo),
      ...MeetupAttendanceSection._attendanceFields(
        this.registrationWithFoodSignup.adultRegistrationCount,
        this.registrationWithFoodSignup.childRegistrationCount
      )
    ];
    if (includeFoodSignups) {
        userElements.push(
            ...AttendeeRow._renderFoodSignup(this.registrationWithFoodSignup.foodRegistration)
        )
    }

    return [
      {
        type: "context",
        elements: userElements,
        block_id: slackUserId
      },
    ];
  }
}

module.exports = AttendeeRow;
