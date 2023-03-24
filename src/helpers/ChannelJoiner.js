const { getInstance } = require('./logger');

const logger = getInstance('ChannelJoiner');

module.exports = {
  tryJoinChannel: async function tryJoinChannel(client, channel) {
    try {
      await client.conversations.join({
        channel,
      });
    } catch (e) {
      logger.debug(`Failed to join channel ${channel}`);
    }
  },
};
