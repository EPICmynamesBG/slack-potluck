
const db = require("../models");
const SignupIncludeUsersForm = require("../views/RegistrationModal/SignupIncludeUsersForm");
const FindMeetupRegGroupUser = require("../models/views/FindMeetupRegGroupUser");
const Tracer = require("../helpers/tracer");
const { getInstance } = require('../helpers/logger');
const ErrorAssistant = require("../helpers/ErrorAssistant");

class RegistrationGroupedUsers {
  static logger = getInstance('RegistrationGroupedUsers');

/**
   * 
   * @param {MeetupRegistration} registration 
   */
  static async tryLinkGroupedRegistration(registration, errorHelper) {
    try {
      var groupedRegistration = await FindMeetupRegGroupUser.ByInclusion({
        meetupId: registration.meetupId,
        slackTeamId: registration.slackTeamId,
        forUser: registration.createdBy
      });
      if (groupedRegistration) {
        groupedRegistration.groupedUserRegistrationId = registration.id;
        groupedRegistration.updatedAt = new Date();
        await groupedRegistration.save();
        return groupedRegistration;
      }
    } catch (e) {
      await errorHelper.handleError(e, "Attempt to link a grouped registration failed");
      return;
    }
  }

  /**
   * 
   * @param {ErrorAssistant} errorHelper 
   * @param {*} ownerRegistration 
   * @param {*} viewState 
   * @returns 
   */
  static async manageIncludedUsersFromState(errorHelper, ownerRegistration, viewState) {
    try {
        var { includedUsers } = SignupIncludeUsersForm.getFormValues(viewState);
        return await this.manageIncludedUsers(ownerRegistration, includedUsers);    
    } catch (e) {
        await errorHelper.handleError(e, "The included users feature is currently broken and disabled");
        return;
    }
  }

  /**
   * 
   * @param {MeetupRegistrationGroupUser[]} groupRegistrations 
   */
  static _removeRecords(groupRegistrations = []) {
    return Promise.all(groupRegistrations.map((record) => record.destroy()));
  }

  static async _createRecord(registration, slackUserId) {
    var existingTargetUserRegistration = await db.MeetupRegistration.findOne({
        where: {
            meetupId: registration.meetupId,
            slackTeamId: registration.slackTeamId,
            createdBy: slackUserId
        }
    });

    return await db.MeetupRegistrationGroupUser.create({
        meetupRegistrationId: registration.id,
        slackTeamId: registration.slackTeamId,
        createdBy: registration.createdBy,
        groupedSlackUserId: slackUserId,
        groupedUserRegistrationId: existingTargetUserRegistration ?
            existingTargetUserRegistration.id :
            undefined
    });
  }

  static _createRecords(registration, slackUserIds = []) {
    return Promise.all(slackUserIds.map(x => this._createRecord(registration, x)));
  }

  static SLACKBOT = "USLACKBOT";

  static _excludeUsers(selfUser) {
    const exclusions = [selfUser, this.SLACKBOT];
    return (x) => !exclusions.includes(x);
  }

  /**
   * 
   * @param {MeetupRegistration} ownerRegistration 
   * @param {string[]} includeUserIds 
   */
  static async manageIncludedUsers(ownerRegistration, includeUserIds = []) {
    return await Tracer.withSpanAsync("RegistrationGroupedUsers.manageIncludedUsers", async (span) => {
      // Prevent user from adding self
      var filteredUserIds = includeUserIds.filter(this._excludeUsers(ownerRegistration.createdBy));
      /**
       * @type {MeetupRegistrationGroupUser[]}
       */
      var groupUsers = await db.MeetupRegistrationGroupUser.findAll({
          where: {
              slackTeamId: ownerRegistration.slackTeamId,
              createdBy: ownerRegistration.createdBy,
              meetupRegistrationId: ownerRegistration.id
          }
      });
      span.setAttribute("app.groupUsers.count", groupUsers.length);
      if (filteredUserIds.length === 0 && groupUsers.length === 0) {
        return;
      }

      /**
       * @type {string[]}
       */
      var existingUserIds = groupUsers.map(x => x.groupedSlackUserId.toString());
      var toCreate = filteredUserIds.filter(x => !existingUserIds.includes(x));
      var toDelete = existingUserIds.filter(x => !filteredUserIds.includes(x));

      if (toCreate.length >= 1 || toDelete.length >= 1) {
        throw new Error("Broken feature disabled");
      }

      /**
       * @type {MeetupRegistrationGroupUser[]}
       */
      var toDeleteRecords = toDelete.map(id => {
        var idx = groupUsers.findIndex(x => x.groupedSlackUserId === id);
        return groupUsers[idx];
      });

      // const tx = await db.sequelize.transaction();
      
      try {
          span.setAttribute("app.createRecords", JSON.stringify(toCreate));
          span.setAttribute("app.deleteRecords", JSON.stringify(toDelete));
          await this._removeRecords(toDeleteRecords);
          await this._createRecords(ownerRegistration, toCreate);
          // await tx.commit();
      } catch (e) {
          span.recordException(e);
          this.logger.error(e);
          // await tx.rollback();
          throw e;
      }
    });
  }
}

module.exports = RegistrationGroupedUsers;
