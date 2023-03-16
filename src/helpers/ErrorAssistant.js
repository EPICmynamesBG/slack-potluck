const _ = require('lodash');

class ErrorAssistant {
  constructor(app, payload) {
    this.app = app;
    this.payload = payload;
  }

  async handleError(e, userMessage = "Something went wrong :disappointed:") {
    console.error(e);

    const meta = _.get(e, 'data.response_metadata');
    if (meta) {
        console.log(meta);
    }

    const { body, respond } = this.payload;
    if (respond) {
      await respond({
        error: true,
        replace_original: false,
        text: userMessage
      });
      return;
    }

    await this.app.client.chat.postMessage({
      channel: body.user.id,
      text: userMessage
    });
  }
}

module.exports = ErrorAssistant;
