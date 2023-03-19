const db = require("../models");
const AnnounceCancellation = require("../views/ManageMeetupModal/AnnounceCancellation");
const AnnounceChanges = require("../views/ManageMeetupModal/AnnounceChanges");
const MeetupCancellation = require("../views/MeetupCancellation");
const SyncAnnouncementPosting = require("./SyncAnnouncementPosting");

class SyncJob {
    constructor(app, meetup, announcements = []) {
        this.app = app;
        this.meetup = meetup;
        this.announcements = announcements;
        this.timeout = setTimeout(() => {
            DeleteAnnouncementPosting.execute(this.app, this.meetup, this.changes)
                .catch((e) => {
                    console.error('[DeleteAnnouncementPosting]', this.meetup.id, e);
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

    static async execute(app, meetup, announcements = []) {
        const announce = new AnnounceCancellation(app, meetup.id);
        const promises = announcements.map(async (announcement) => {
            await app.client.chat.update({
                channel: announcement.postingChannelId,
                ts: announcement.postingMessageId,
                unfurl_links: false,
                blocks: MeetupCancellation.render(meetup),
            });

            await announce.render({
                channel: announcement.postingChannelId,
                originalMessageId: announcement.postingMessageId,
            });
        });
        await Promise.all(promises);
    }

    static defer(app, meetup, announcements = []) {
        const job = this.jobs[meetup.id];
        if (job) {
            job.cancel();
        }
        this.jobs[meetup.id] = new SyncJob(app, meetup, announcements);
    }
}

module.exports = DeleteAnnouncementPosting;
