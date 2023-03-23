module.exports = {
  tryJoinChannel: async function tryJoinChannel(client, channel) {
    try {
      await client.conversations.join({
        channel,
      });
    } catch (e) {
      console.warn(`Failed to join channel ${channel}`);
    }
  },
};
