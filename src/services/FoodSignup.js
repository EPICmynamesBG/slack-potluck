const _ = require("lodash");
const db = require("../models");
const ErrorAssistant = require("../helpers/ErrorAssistant");
const RegistrationModal = require('../views/RegistrationModal');
const FoodSignupForm = require('../views/RegistrationModal/FoodSignupForm');

class FoodSignup {
  static async renderSignupModal(payload) {    
    const { client } = payload;
    const renderer = new RegistrationModal(client);
    return await renderer.render(payload);
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

  static async recordResponse(payload) {
    const { body, view } = payload;
    const meta = JSON.parse(_.get(view, "private_metadata", "{}"));
    const { meetupId } = meta;
    const { foodType, description } = FoodSignupForm.getFormValues(view.state);

    await this._createOrUpdateRegistration(new ErrorAssistant(payload), {
      meetupId,
      slackTeamId: body.user.team_id,
      slackUserId: body.user.id,
      foodType,
      description,
    });
  }
}

module.exports = FoodSignup;
