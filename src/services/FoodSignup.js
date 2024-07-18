const _ = require("lodash");

const db = require("../models");
const ErrorAssistant = require("../helpers/ErrorAssistant");
const Tracer = require("../helpers/tracer");
const RegistrationModal = require('../views/RegistrationModal');
const FoodSignupForm = require('../views/RegistrationModal/FoodSignupForm');
const PayloadHelper = require("../helpers/PayloadHelper");
const { getInstance } = require('../helpers/logger');

class FoodSignup {
  static logger = getInstance('FoodSignup');

  static async renderSignupModal(payload) {
    const span = Tracer.get().startSpan("FoodSignup.renderSignupModal");
    try {
      const payloadHelper = new PayloadHelper(payload);
    
      const { action, client, context, body } = payload;
      const renderer = new RegistrationModal(client);
      span.setAttribute("app.user.slackUserId", body.user.id);
      span.setAttribute("app.user.slackTeamId", body.user.team_id);

      return await renderer.render({
        channel: payloadHelper.getChannel(),
        botToken: context.botToken,
        triggerId: body.trigger_id,
        meetupId: action.value,
        slackUserId: body.user.id,
        slackTeamId: body.user.team_id
      });
    } catch (e) {
      span.recordException(e);
      throw e;
    } finally {
      span.end();
    }
  }

  static async _createOrUpdateRegistration(
    errorHelper,
    { meetupId, slackUserId, slackTeamId, foodType, description }
  ) {
    await Tracer.withSpanAsync("FoodSignup._createOrUpdateRegistration", async (span) => {
      span.setAttribute("app.user.slackUserId", slackUserId);
      span.setAttribute("app.user.slackTeamId", slackTeamId);
      let registration;
      try {
        registration = await db.MeetupRegistration.findOne({
          where: {
            meetupId,
            createdBy: slackUserId,
            slackTeamId,
          },
          include: ["foodRegistration", "meetup"],
        });
        span.setAttribute("registration.meetup.includeFoodSignup", String(_.get(registration, "meetup.includeFoodSignup")));
        if (_.get(registration, "meetup.includeFoodSignup") == false) {
          this.logger.debug("Skipping Food Signup for meetup");
          return;
        }
      } catch (e) {
        span.recordException(e);
        await errorHelper.handleError(e, "Meetup registration not found");
        return;
      }
      try {
        if (registration.foodRegistration) {
          return await Tracer.withSpanAsync("_updateFoodRegistration", async (s2) => {
            s2.setAttribute("app.user.slackUserId", slackUserId);
            s2.setAttribute("app.user.slackTeamId", slackTeamId);  
            registration.foodRegistration.foodSlot = foodType;
            registration.foodRegistration.description = description;
            registration.foodRegistration.updatedAt = new Date();
            await registration.foodRegistration.save();  
            return registration.foodRegistration;
          });
        }
        return await Tracer.withSpanAsync("_createFoodRegistration", async (s2) => {
          s2.setAttribute("app.user.slackUserId", slackUserId);
          s2.setAttribute("app.user.slackTeamId", slackTeamId);
          return await db.MeetupRegistrationFood.create({
            meetupRegistrationId: registration.id,
            createdBy: slackUserId,
            slackTeamId,
            foodSlot: foodType,
            description,
          });  
        });
      } catch (e) {
        span.recordException(e);
        await errorHelper.handleError(e, "Failed to store food response");
        return;
      }
    });
  }

  static async recordResponse(payload) {
    await Tracer.withSpanAsync("FoodSignup.recordResponse", async (_span) => {
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
    });
  }
}

module.exports = FoodSignup;
