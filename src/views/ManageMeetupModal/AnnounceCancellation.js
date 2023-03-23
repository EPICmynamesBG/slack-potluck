const { tryJoinChannel } = require('../../helpers/ChannelJoiner');

class AnnounceCancellation {
    constructor(client, meetup) {
        this.client = client;
        this.meetupId = meetup;
    }

    async render({
        channel,
        originalMessageId
    }) {
        await tryJoinChannel(this.client, channel);
        await this.client.chat.postMessage({
            channel,
            thread_ts: originalMessageId,
            blocks: AnnounceCancellation.render()
        });
    }

    static render() {
        return [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: 'Meetup Cancelled!'
                }
            }
        ];
    }
}

module.exports = AnnounceCancellation;
