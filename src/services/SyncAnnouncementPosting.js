const db = require("../models");
const MeetupWithRegistrationCount = require("../models/views/MeetupWithRegistrationCount");
const MeetupAnnouncement = require("../views/MeetupAnnouncement");

class SyncJob {
    constructor(app, meetupId) {
        this.app = app;
        this.id = meetupId;
        this.timeout = setTimeout(() => {
            SyncAnnouncementPosting.execute(this.app, this.id)
                .catch((e) => {
                    console.error('[SyncAnnouncementPosting]', this.id, e);
                })
                .finally(() => {
                    delete SyncAnnouncementPosting.jobs[this.id];
                });
        }, SyncAnnouncementPosting.DEFER_TIME);
    }

    cancel() {
        clearTimeout(this.timeout);
    }
}

class SyncAnnouncementPosting {
    static DEFER_TIME = 5000; // 5 seconds

    // { id: SyncJob }
    static jobs = {};

    static async execute(app, meetupId) {
        const meetup = await MeetupWithRegistrationCount.getMeetup(meetupId);
        const announcements = await db.MeetupAnnouncement.findAll({
            where: {
                meetupId
            }
        });
        const promises = announcements.map(async (announcement) => {
            await app.client.chat.update({
                channel: announcement.postingChannelId,
                ts: announcement.postingMessageId,
                unfurl_links: false,
                blocks: MeetupAnnouncement.render(meetup, true),
            });
        });
        await Promise.all(promises);
    }

    static defer(app, meetupId) {
        const job = this.jobs[meetupId];
        if (job) {
            job.cancel();
        }
        this.jobs[meetupId] = new SyncJob(app, meetupId);
    }
}

module.exports = SyncAnnouncementPosting;
