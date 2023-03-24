const _ = require("lodash");
const { FileInstallationStore } = require("@slack/bolt");
const db = require("../models");
const OAuthInstallationDTO = require("../DTO/OAuthInstallationDTO");
const { getInstance } = require('../helpers/logger');

const logger = getInstance('OAuthInstallationStore');

let singleton;

/**
 * @type {import('@slack/bolt').InstallationStore}
 */
class OAuthInstallationStore extends FileInstallationStore {
  constructor(clientId) {
    super();
    this._clientId = clientId;
  }

  /**
   *
   * @param {import("@slack/bolt").Installation} installation
   * @param {*} logger
   */
  async storeInstallation(installation) {
    if (installation.tokenType !== "bot") {
      logger.error('Only bot tokenType is supported', installation);
      throw new Error("Only bot tokenType is supported");
    }

    try {
      const existing = await db.OAuthInstallation.findOne({
        where: {
          slackTeamId: installation.team.id,
          createdBy: installation.user.id,
        },
      });
      if (existing) {
        existing.scopesGranted = installation.bot.scopes;
        existing.slackBotObject = installation.bot;
        existing.slackUserObjet = installation.user;
        existing.updatedAt = new Date();
        await existing.save();
        logger.info(
          `Team ${installation.team.id} installation updated`, installation
        );
        return;
      }
      await db.OAuthInstallation.create({
        slackTeamId: installation.team.id,
        slackEnterpriseId: _.get(installation, "enterprise.id"),
        scopesGranted: installation.bot.scopes,
        slackBotObject: installation.bot,
        slackUserObjet: installation.user,
        createdBy: installation.user.id,
      });
      logger.info(
        `Team ${installation.team.id} installation created`, installation
      );
    } catch (e) {
      logger.error('OAuth Installation failed', e, installation);
      throw new Error('OAuth Installation failed. Please contact developer.');
    }
  }

  /**
   *
   * @param {import("@slack/bolt").InstallationQuery} query
   * @param {*} logger
   * @returns {db.OAuthInstallation}
   */
  async _multiLookup(query) {
    const primary = {
      where: {
        slackTeamId: query.teamId,
      },
      order: [
        ["updatedAt", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit: 1,
    };
    let record;
    if (query.userId) {
      const firstAttempt = { ...primary };
      firstAttempt.where.createdBy = query.userId;
      record = await db.OAuthInstallation.findOne(firstAttempt);
      if (record) {
        logger.debug(
          `Lookup with user id matched ${record.id}`, query
        );
        return record;
      }
    }
    logger.debug(
      `Lookup with by team ${query.teamId}`, query
    );
    record = await db.OAuthInstallation.findOne(primary);
    return record;
  }

  /**
   *
   * @param {import("@slack/bolt").InstallationQuery} query
   * @param {*} logger
   * @returns {db.OAuthInstallation}
   */
  async _findInstallation(query) {
    logger.debug(`Lookup with by team ${query.teamId}`, query);
    const existing = await this._multiLookup(query, logger);
    if (!existing) {
      logger.error(`team:${query.teamId} not found`, query);
      throw new Error(
        `team:${query.teamId} not found`
      );
    }
    return existing;
  }

  /**
   *
   * @param {import("@slack/bolt").InstallationQuery} query
   * @param {*} logger
   * @returns {import("@slack/bolt").Installation}
   */
  async fetchInstallation(query) {
    const existing = await this._findInstallation(query, logger);

    logger.debug(
      `Fetched OAuthInstallation ${existing.id}`,
      query
    );

    return (new OAuthInstallationDTO(existing)).asInstallation();
  }

  /**
   *
   * @param {import("@slack/bolt").InstallationQuery} query
   * @param {*} logger
   */
  async deleteInstallation(query) {
    logger.debug(
      `Delete requested for team ${query.teamId}`, query
    );
    const existing = await this._findInstallation(query, logger);
    logger.info(
      `Deleting installation ${existing.id} for team ${query.teamId}`, query
    );
    await existing.destroy();
    // TODO: Purge all DB tables by slackTeamId when all of a team's installations are
    if (await OAuthInstallationStore.shouldPurgeTeamData(query.teamId)) {
      logger.info('Should purge data', query);
      await OAuthInstallationStore.purgeTeamData(query.teamId, logger);
    }
  }

  static async shouldPurgeTeamData(slackTeamId) {
    const count = await db.OAuthInstallation.count({
      where: {
        slackTeamId,
      },
    });
    return count == 0;
  }

  static async purgeTeamData(slackTeamId) {
    // due to Cascade, all related should be deleted.
    logger.warn(
      `Purge all data for slack team ${slackTeamId}`
    );
    // await db.Meetup.destroy({
    //   where: {
    //     slackTeamId
    //   }
    // });
  }

  static init(clientId) {
    if (!singleton) {
      singleton = new OAuthInstallationStore(clientId);
    }
    return singleton;
  }

  static get() {
    if (!singleton) {
      this.init(process.env.SLACK_CLIENT_ID);
    }
    return singleton;
  }
}

module.exports = OAuthInstallationStore;
