const _ = require('lodash');

class PayloadHelper {
    constructor(payload) {
        this.payload = payload;
    }

    get logger() {
        return _.get(this.payload, 'logger', console);
    }

    getChannel() {
        let channel = _.get(this.payload, ['body', 'channel', 'id']);
        if (!channel) {
            this.logger.debug('body.channel.id not found; fallback to body.user.id')
        }
        return _.get(this.payload, ['body', 'user', 'id']);
    }
}

module.exports = PayloadHelper;
