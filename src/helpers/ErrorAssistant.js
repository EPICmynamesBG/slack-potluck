const _ = require('lodash');
const PayloadHelper = require('./PayloadHelper');
const { tryJoinChannel } = require('./ChannelJoiner');
const { getInstance } = require('./logger');

const logger = getInstance('ErrorAssistant');

class ErrorAssistant {
  constructor(payload) {
    this.payload = payload;
    this.helper = new PayloadHelper(payload);
  }

  async handleError(e, userMessage = "Something went wrong :disappointed:") {
    logger.error(userMessage, e);

    const meta = _.get(e, 'data.response_metadata');
    if (meta) {
        logger.info('Metadata', meta);
    }

    const { respond, client } = this.payload;
    if (respond) {
      await respond({
        error: true,
        replace_original: false,
        text: userMessage
      });
      return;
    }

    await tryJoinChannel(client, payloadHelper.getUserId());

    await client.chat.postMessage({
      channel: this.helper.getUserId(),
      text: userMessage
    });
  }
}

module.exports = ErrorAssistant;
