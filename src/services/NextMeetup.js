const { Op } = require("sequelize");

const db = require('../models');
const ErrorAssistant = require('../helpers/ErrorAssistant');
const MeetupAnnouncement = require("../views/MeetupAnnouncement");
const PayloadHelper = require('../helpers/PayloadHelper');
const { tryJoinChannel } = require('../helpers/ChannelJoiner');

class NextMeetup {

    static async execute(payload) {
        const { client } = payload;
        const payloadHelper = new PayloadHelper(payload);
        const errorHelper = new ErrorAssistant(payload);

        let nextMeetup;
        try {
            nextMeetup = await db.Meetup.findOne({
                where: {
                    slackTeamId: payloadHelper.getTeamId(),
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
        await tryJoinChannel(client, payloadHelper.getChannel());
        if (!nextMeetup) {
            await client.chat.postEphemeral({
                user: payloadHelper.getUserId(),
                channel: payloadHelper.getChannel(),
                text: 'No meetups are currently scheduled'
            });
            return;
        }
        await client.chat.postEphemeral({
            user: payloadHelper.getUserId(),
            channel: payloadHelper.getChannel(),
            unfurl_links: false,
            blocks: MeetupAnnouncement.render(nextMeetup),
        });
    }
}

module.exports = NextMeetup;
