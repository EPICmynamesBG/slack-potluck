const _ = require('lodash');
const PayloadHelper = require('./PayloadHelper');
const { tryJoinChannel } = require('./ChannelJoiner');

class ErrorAssistant {
  constructor(payload) {
    this.payload = payload;
    this.helper = new PayloadHelper(payload);
  }

  async handleError(e, userMessage = "Something went wrong :disappointed:") {
    console.error(e);

    const meta = _.get(e, 'data.response_metadata');
    if (meta) {
        console.log(meta);
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
