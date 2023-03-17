const { Op } = require("sequelize");

const db = require('../models');
const ErrorAssistant = require('../helpers/ErrorAssistant');
const MeetupAnnouncement = require("../views/MeetupAnnouncement");

class NextMeetup {

    static async execute(app, payload) {
        const { body } = payload;
        const errorHelper = new ErrorAssistant(app, payload);

        let nextMeetup;
        try {
            nextMeetup = await db.Meetup.findOne({
                where: {
                    slackTeamId: body.user.team_id,
                    timestamp: {
                        [Op.gt]: new Date()
                    }
                },
                order: [
                    ['timestamp', 'DESC']
                ],
                limit: 1
            });
        } catch (e) {
            await errorHelper.handleError(e);
            return;
        }
        if (!nextMeetup) {
            await app.client.chat.postMessage({
                channel: body.user.id,
                text: 'No meetups are currently scheduled'
            });
            return;
        }
        await app.client.chat.postMessage({
            channel: body.user.id,
            unfurl_links: false,
            blocks: MeetupAnnouncement.render(nextMeetup),
        });
    }
}

module.exports = NextMeetup;
