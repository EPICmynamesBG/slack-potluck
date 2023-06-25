const _ = require("lodash");
const FoodSlot = require("../../models/constants/FoodSlot");
const MeetupAttendanceSection = require("../MeetupAttendanceSection");
const { getInstance } = require("../../helpers/logger");

const logger = getInstance("AttendeeRow");

class AttendeeRow {
  constructor(client, registrationWithFoodSignup) {
    this.client = client;
    this.registrationWithFoodSignup = registrationWithFoodSignup;
    this._userInfo = undefined;
  }

  static FoodSlotIconMap = {
    [FoodSlot.MAIN_DISH]: ":shallow_pan_of_food:",
    [FoodSlot.SIDE_DISH]: ":corn:",
    [FoodSlot.BEVERAGES]: ":sake:",
    [FoodSlot.DESSERT]: ":cupcake:",
    [FoodSlot.UNDECIDED]: ":question:",
  };

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
      const { user } = await this.client.users.info({
        user: this.registrationWithFoodSignup.createdBy,
      });
      this._userInfo = user;
    } catch (e) {
      logger.error(
        `Failed to fetch user info for meetup registration ${this.registrationWithFoodSignup.id}`,
        e
      );
    }
    return this._userInfo;
  }

  static _renderUserInfo(
    slackUserId,
    userInfo = undefined,
    organizerSlackId = undefined
  ) {
    const isOrganizerIndicator =
      slackUserId === organizerSlackId ? " :clipboard:" : "";
    if (userInfo) {
      return [
        {
          type: "image",
          image_url: userInfo.profile.image_192,
          alt_text: userInfo.name,
        },
        {
          type: "mrkdwn",
          text: `@${userInfo.name}${isOrganizerIndicator}`,
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
        text: `*${slackUserId}*${isOrganizerIndicator}`,
      },
    ];
  }

  static _renderGroupedUsers(includedInGroupRegistration = []) {
    if (includedInGroupRegistration.length == 0) {
      return [];
    }
    var msg = includedInGroupRegistration.map(x => `@${x.groupedSlackUserId}`)
      .join(',');
    return [
      {
        type: 'mrkdwn',
        text: `Includes: ${msg}`
      }
    ];
  }

  static _renderRegistrationNotes(notes = undefined) {
    return [
      {
        type: 'mrkdwn',
        text: `Note: ${notes}`
      }
    ];
  }

  static _renderFoodSignup(foodRegistration = undefined) {
    const slot = foodRegistration
      ? foodRegistration.foodSlot
      : FoodSlot.UNDECIDED;
    const description = _.get(foodRegistration, "description");
    const icon = this.FoodSlotIconMap[slot];
    let message = `${icon} ${slot}`;
    if (description) {
      message += ` _${description}_`;
    }
    return [
      {
        type: "mrkdwn",
        text: message,
      },
    ];
  }

  async render(includeFoodSignups = false, organizerSlackId = undefined) {
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
      ...AttendeeRow._renderUserInfo(slackUserId, userInfo, organizerSlackId),
      ...MeetupAttendanceSection._attendanceFields(
        this.registrationWithFoodSignup.adultRegistrationCount,
        this.registrationWithFoodSignup.childRegistrationCount
      ),
    ];
    if (includeFoodSignups) {
      userElements.push(
        ...AttendeeRow._renderFoodSignup(
          this.registrationWithFoodSignup.foodRegistration
        )
      );
    }
    if (this.registrationWithFoodSignup.meetupGroupUsers) {
      userElements.push(
        ...AttendeeRow._renderGroupedUsers(this.registrationWithFoodSignup.meetupGroupUsers)
      );
    }
    if (this.registrationWithFoodSignup.notes) {
      userElements.push(
        ...AttendeeRow._renderRegistrationNotes(this.registrationWithFoodSignup.notes)
      );
    }

    return [
      {
        type: "context",
        elements: userElements,
        block_id: slackUserId,
      },
    ];
  }
}

module.exports = AttendeeRow;
