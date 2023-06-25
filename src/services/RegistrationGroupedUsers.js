
const db = require("../models");
const SignupIncludeUsersForm = require("../views/RegistrationModal/SignupIncludeUsersForm");

class RegistrationGroupedUsers {
/**
   * 
   * @param {MeetupRegistration} registration 
   */
  static async tryLinkGroupedRegistration(registration) {
    try {
      var groupedRegistration = await db.MeetupRegistrationGroupUser.FindInclusionRegistration({
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

  static async manageIncludedUsersFromState(errorHelper, ownerRegistration, viewState) {
    try {
        var { includedUsers } = SignupIncludeUsersForm.getFormValues(viewState);
        return this.manageIncludedUsers(ownerRegistration, includedUsers);    
    } catch (e) {
        await errorHelper.handleError(e);
        return;
    }
  }

  /**
   * 
   * @param {MeetupRegistrationGroupUser} groupRegistrations 
   */
  static _removeRecords(groupRegistrations = []) {
    return Promise.all(groupRegistrations.map(x => x.delete()));
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

  /**
   * 
   * @param {MeetupRegistration} ownerRegistration 
   * @param {string[]} includeUserIds 
   */
  static async manageIncludedUsers(ownerRegistration, includeUserIds = []) {
    var groupUsers = await db.MeetupRegistrationGroupUser.findAll({
        where: {
            slackTeamId: ownerRegistration.slackTeamId,
            createdBy: ownerRegistration.createdBy,
            meetupRegistrationId: ownerRegistration.id
        }
    });

    var existingUserIds = groupUsers.map(x => x.id);
    var toCreate = includeUserIds.filter(x => !existingUserIds.includes(x));
    var toDelete = existingUserIds.filter(x => !includeUserIds.includes(x));

    var toDeleteRecords = toDelete.map(id => groupUsers.find(x => x.id === id));

    const tx = await db.sequelize.transaction();
    try {
        await this._removeRecords(toDeleteRecords);
        await this._createRecords(registration, toCreate);
    } catch (e) {
        await tx.rollback();
        throw e;
    }
  }
}

module.exports = RegistrationGroupedUsers;
