const _ = require("lodash");
const { tryJoinChannel } = require('./ChannelJoiner');

class PayloadHelper {
  constructor(payload) {
    this.payload = payload;
  }

  get logger() {
    return _.get(this.payload, "logger", console);
  }

  getChannel() {
    let channel = _.get(this.payload, ["body", "channel", "id"]) || _.get(this.payload, 'body.channel_id');
    if (!channel) {
      this.logger.debug("body.channel.id not found; fallback to userId");
      channel = this.getUserId();
    }
    return channel;
  }

  getState() {
    let state = _.get(this.payload, ["body", "state"]);
    if (!state) {
      this.logger.debug("body.state not found; fallback to view.state");
      state = _.get(this.payload, ["body", "view", "state"]);
    }
    if (!state) {
      this.logger.debug("body.view.state not found; fallback to view.state");
      state = _.get(this.payload, ["view", "state"]);
    }
    return state;
  }

  getUserId() {
    return _.get(this.payload, 'body.user.id') || _.get(this.payload, 'body.user_id') || _.get(this.payload, 'context.userId');
  }

  getTeamId() {
    return _.get(this.payload, 'body.user.team_id') || _.get(this.payload, 'body.team_id')  || _.get(this.payload, 'context.teamId');
  }

  async respond(blob) {
    if (this.payload.respond) {
      await this.payload.respond(blob);
      return;
    }
    const { text } = blob;
    await tryJoinChannel(this.payload.client, payloadHelper.getChannel());
    await this.payload.client.chat.postEphemeral({
      channel: this.getChannel(),
      user: this.getUserId(),
      text,
    });
  }

  getPrivateMetadata() {
    const meta = JSON.parse(_.get(this.payload, "view.private_metadata", "{}"));
    return meta;
  }
}

module.exports = PayloadHelper;
