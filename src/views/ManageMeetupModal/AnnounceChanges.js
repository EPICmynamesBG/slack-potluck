const { dateFromUnix } = require("../../helpers/datetime");
const DateTimeHelpers = require("../../helpers/datetime");

class AnnounceChanges {
    constructor(client, meetupId, changes) {
        this.client = client;
        this.meetupId = meetupId;
        this.changes = changes;
    }

    async render({
        channel,
        originalMessageId
    }) {
        const blocks = AnnounceChanges.render(this.changes);
        if (blocks.length === 0) {
            console.debug('[AnnounceChanges] No noteworthy changes to announce');
            return;
        }

        await this.client.chat.postMessage({
            channel,
            thread_ts: originalMessageId,
            blocks: AnnounceChanges.render(this.changes)
        });
    }

    static FieldChangeMessagingMap = {
        'timestamp': 'Meetup Time',
        'locationAddress': 'Meetup Address',
        'includeFoodSignup': 'Bring Food',
        'locationAlias': null,
        'additionalNotes': 'Additional Notes'
    };

    static _renderChangeBlock(field, oldValue, newValue) {
        const headline = this.FieldChangeMessagingMap[field];
        if (!headline) {
            return;
        }

        let message;
        switch (field) {
            case 'timestamp':
                message = `${headline}: Updated from ${DateTimeHelpers.humanReadable(dateFromUnix(oldValue))} to *${DateTimeHelpers.humanReadable(dateFromUnix(newValue))}*`;
                break;
            case 'includeFoodSignup':
                if (newValue) {
                    message = `${headline}: Please!`
                } else {
                    message = `${headline}: No longer necessary`
                }
                break;
            case 'locationAddress':
                message = `${headline}: Updated from ${oldValue} to *${newValue}*`;
                break;
            default:
                message = headline;
        }


        // For now, ignore rendering the actual value changes. Just announce the fields.
        return {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: message
            }
        }
    }

    static render(changes) {
        const rendered = Object.keys(changes).map((field) => {
            const [oldVal, newVal] = changes[field];
            return this._renderChangeBlock(field, oldVal, newVal);
        }).filter((val) => !!val);
        if (rendered.length === 0) {
            return [];
        }

        return [
            {
                type: 'header',
                text: {
                    type: 'plain_text',
                    text: 'Meetup Changes'
                }
            },
            ...rendered
        ];
    }
}

module.exports = AnnounceChanges;
