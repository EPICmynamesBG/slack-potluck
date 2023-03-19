class AnnounceCancellation {
    constructor(app, meetup) {
        this.app = app;
        this.meetupId = meetup;
    }

    async render({
        channel,
        originalMessageId
    }) {
        await this.app.client.chat.postMessage({
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
