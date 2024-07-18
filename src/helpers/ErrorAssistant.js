const openTelemetry = require('@opentelemetry/sdk-node');
const _ = require('lodash');
const PayloadHelper = require('./PayloadHelper');
const { tryJoinChannel } = require('./ChannelJoiner');
const { getInstance } = require('./logger');
const Tracer = require('./tracer');

const logger = getInstance('ErrorAssistant');

class ErrorAssistant {
  constructor(payload) {
    this.payload = payload;
    this.helper = new PayloadHelper(payload);
  }

  async handleError(e, userMessage = "Something went wrong :disappointed:") {
    var activeSpan = openTelemetry.api.trace.getActiveSpan();
    if (activeSpan) {
      activeSpan.recordException(e);
    }
    return await Tracer.withSpanAsync("ErrorAssistant.handleError", async (s2) => {
      logger.error(userMessage, e);
      Tracer.setWarning(s2, e);

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
  
      await tryJoinChannel(client, this.helper.getUserId());
  
      await client.chat.postMessage({
        channel: this.helper.getUserId(),
        text: userMessage
      });
    });
  }
}

module.exports = ErrorAssistant;
