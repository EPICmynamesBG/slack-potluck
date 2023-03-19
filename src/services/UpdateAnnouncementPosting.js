const db = require("../models");
const AnnounceChanges = require("../views/ManageMeetupModal/AnnounceChanges");
const SyncAnnouncementPosting = require("./SyncAnnouncementPosting");

class SyncJob {
    constructor(app, meetupId, changes = {}) {
        this.app = app;
        this.id = meetupId;
        this.changes = changes;
        this.timeout = setTimeout(() => {
            UpdateAnnouncementPosting.execute(this.app, this.id, this.changes)
                .catch((e) => {
                    console.error('[UpdateAnnouncementPosting]', this.id, e);
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
    static DEFER_TIME = 1000 * 60 * 5; // 5 minutes

    // { id: SyncJob }
    static jobs = {};

    static async execute(app, meetupId, changes = {}) {
        await SyncAnnouncementPosting.execute(app, meetupId);

        const announcements = await db.MeetupAnnouncement.findAll({
            where: {
                meetupId
            }
        });
        const announceChanges = new AnnounceChanges(app, meetupId, changes);
        const promises = announcements.map(async (announcement) => {
            await announceChanges.render({
                channel: announcement.postingChannelId,
                originalMessageId: announcement.postingMessageId,
            });
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

    static defer(app, meetupId, changes = {}) {
        const job = this.jobs[meetupId];
        let withChanges = changes;
        if (job) {
            withChanges = this._mergeChanges(job.changes, changes);
            job.cancel();
        }
        this.jobs[meetupId] = new SyncJob(app, meetupId, withChanges);
    }
}

module.exports = UpdateAnnouncementPosting;
