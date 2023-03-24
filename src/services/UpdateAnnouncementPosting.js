const db = require("../models");
const AnnounceChanges = require("../views/ManageMeetupModal/AnnounceChanges");
const SyncAnnouncementPosting = require("./SyncAnnouncementPosting");
const { getInstance } = require('../helpers/logger');

const logger = getInstance('UpdateAnnouncementPosting');

class SyncJob {
    constructor(client, meetupId, changes = {}) {
        this.client = client;
        this.id = meetupId;
        this.changes = changes;
        this.timeout = setTimeout(() => {
            UpdateAnnouncementPosting.execute(this.client, this.id, this.changes)
                .catch((e) => {
                    logger.error(this.id, e);
                })
                .finally(() => {
                    delete UpdateAnnouncementPosting.jobs[this.id];
                });
        }, UpdateAnnouncementPosting.DEFER_TIME);
    }

    cancel() {
        clearTimeout(this.timeout);
    }
}

class UpdateAnnouncementPosting {
    static DEFER_TIME = process.env.DEBUG ? 5000 : 1000 * 60 * 5; // 5 minutes

    // { id: SyncJob }
    static jobs = {};

    static async execute(client, meetupId, changes = {}) {
        await SyncAnnouncementPosting.execute(client, meetupId);

        const announcements = await db.MeetupAnnouncement.findAll({
            where: {
                meetupId
            }
        });
        const announceChanges = new AnnounceChanges(client, meetupId, changes);
        const promises = announcements.map(async (announcement) => {
            try {
                await announceChanges.render({
                    channel: announcement.postingChannelId,
                    originalMessageId: announcement.postingMessageId,
                });
            } catch (e) {
                logger.error(`Failed to thread on announcement ${announcement.id}`, e);
            }
        });
        await Promise.all(promises);
    }

    static _mergeChanges(originalChanges, newChanges) {
        return _.mergeWith(originalChanges, newChanges, (newValue, srcValue) => {
            const [originalFieldValue] = srcValue;
            const [,latestValue] = newValue;
            return [originalFieldValue, latestValue];
        });
    }

    static defer(client, meetupId, changes = {}) {
        const job = this.jobs[meetupId];
        let withChanges = changes;
        if (job) {
            withChanges = this._mergeChanges(job.changes, changes);
            job.cancel();
        }
        this.jobs[meetupId] = new SyncJob(client, meetupId, withChanges);
    }
}

module.exports = UpdateAnnouncementPosting;
