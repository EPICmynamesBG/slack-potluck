const AnnounceCancellation = require("../views/ManageMeetupModal/AnnounceCancellation");
const MeetupCancellation = require("../views/MeetupCancellation");
const { getInstance } = require('../helpers/logger');

const logger = getInstance('DeleteAnnouncementPosting');


class SyncJob {
    constructor(client, meetup, announcements = []) {
        this.client = client;
        this.meetup = meetup;
        this.announcements = announcements;
        this.timeout = setTimeout(() => {
            DeleteAnnouncementPosting.execute(this.client, this.meetup, this.changes)
                .catch((e) => {
                    logger.error(this.meetup.id, e);
                })
                .finally(() => {
                    delete DeleteAnnouncementPosting.jobs[this.meetup.id];
                });
        }, DeleteAnnouncementPosting.DEFER_TIME);
    }

    cancel() {
        clearTimeout(this.timeout);
    }
}

class DeleteAnnouncementPosting {
    static DEFER_TIME = 500; // 0.5 seconds

    // { id: SyncJob }
    static jobs = {};

    static async execute(client, meetup, announcements = []) {
        const announce = new AnnounceCancellation(client, meetup.id);
        const promises = announcements.map(async (announcement) => {
            try {
                 await client.chat.update({
                    channel: announcement.postingChannelId,
                    ts: announcement.postingMessageId,
                    unfurl_links: false,
                    blocks: MeetupCancellation.render(meetup),
                });
            } catch (e) {
                logger.error(`Failed to announce deletion in thread for announcement ${announcement.id}`, e);
            }

            try {
                await announce.render({
                    channel: announcement.postingChannelId,
                    originalMessageId: announcement.postingMessageId,
                });
            } catch (e) {
                logger.error(`Failed to updated announcement ${announcement.id}`, e);
            }
        });
        await Promise.all(promises);
    }

    static defer(client, meetup, announcements = []) {
        const job = this.jobs[meetup.id];
        if (job) {
            job.cancel();
        }
        this.jobs[meetup.id] = new SyncJob(client, meetup, announcements);
    }
}

module.exports = DeleteAnnouncementPosting;
