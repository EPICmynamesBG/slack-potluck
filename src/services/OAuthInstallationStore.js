const _ = require('lodash');
const { FileInstallationStore } = require("@slack/bolt");
const db = require('../models');

/**
 * @type {import('@slack/bolt').InstallationStore}
 */
class OAuthInstallationStore extends FileInstallationStore {
  constructor(clientId) {
    this._clientId = clientId;
  }

  /**
   * 
   * @param {import("@slack/bolt").Installation} installation 
   * @param {*} logger 
   */
  async storeInstallation(installation, logger) {
    if (installation.tokenType !== 'bot') {
        throw new Error('Only bot tokenType is supported');
    }

    const existing = await db.OAuthInstallation.findOne({
        where: {
            slackTeamId: installation.team.id,
            createdBy: installation.user.id
        }
    });
    if (existing) {
        existing.scopesGranted = installation.bot.scopes;
        existing.slackBotObject = installation.bot;
        existing.slackUserObjet = installation.user;
        existing.updatedAt = new Date();
        await existing.save()
        logger.info(`Team ${installation.team.id} installation updated`);
        return;
    }
    await db.OAuthInstallation.create({
        slackTeamId: installation.team.id,
        slackEnterpriseId: _.get(installation, 'enterprise.id'),
        scopesGranted: installation.bot.scopes,
        slackBotObject: installation.bot,
        slackUserObjet: installation.user,
        createdBy: installation.user.id
    });
    logger.info(`Team ${installation.team.id} installation created`);
}

  /**
   *
   * @param {import("@slack/bolt").InstallationQuery} query
   * @param {*} logger
   * @returns {db.OAuthInstallation}
   */
  async _multiLookup(query, logger) {
    const primary = {
        where: {
            slackTeamId: query.teamId,
        },
        order: [
            ['updatedAt', 'DESC'],
            ['createdAt', 'DESC']
        ],
        limit: 1
    };
    let record;
    if (query.userId) {
        const firstAttempt = { ...primary };
        firstAttempt.where.createdBy = query.userId;
        record = await db.OAuthInstallation.findOne(firstAttempt);
        if (record) {
            logger.debug(`[OAuthInstallationStore] Lookup with user id matched ${record.id}`);
            return record;
        }
    }
    logger.debug(`[OAuthInstallationStore] Lookup with by team ${query.teamId}`);
    record = await db.OAuthInstallation.findOne(primary);
    return record;
}

  /**
   *
   * @param {import("@slack/bolt").InstallationQuery} query
   * @param {*} logger
   * @returns {db.OAuthInstallation}
   */
  async _findInstallation(query, logger) {
    // NOTE: so long as we're only utilizing bot token, this query is sufficient
    const existing = await this._multiLookup(query, logger);
    if (!existing) {
        throw new Error(`OAuthInstallation team:${query.teamId} not found`);
    }
    return existing;
  }

  /**
   *
   * @param {import("@slack/bolt").InstallationQuery} query
   * @param {*} logger
   * @returns {import("@slack/bolt").Installation}
   */
  async fetchInstallation(query, logger) {
    const existing = await this._findInstallation(query, logger);

    logger.debug(`Fetched OAuthInstallation ${existing.id}`);
    return existing.asInstallation();
  }

  /**
   *
   * @param {import("@slack/bolt").InstallationQuery} query
   * @param {*} logger
   */
  async deleteInstallation(query, logger) {
    const existing = await this._findInstallation(query, logger);
    logger.info(`Deleting installation ${existing.id} for team ${query.teamId}`);
    await existing.destroy();
    // TODO: Purge all DB tables by slackTeamId when all of a team's installations are
    // removed from the system
  }
}

module.exports = OAuthInstallationStore;
