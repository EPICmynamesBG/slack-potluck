const _ = require("lodash");

class PayloadHelper {
  constructor(payload) {
    this.payload = payload;
  }

  get logger() {
    return _.get(this.payload, "logger", console);
  }

  getChannel() {
    let channel = _.get(this.payload, ["body", "channel", "id"]);
    if (!channel) {
      this.logger.debug("body.channel.id not found; fallback to body.user.id");
      channel = _.get(this.payload, ["body", "user", "id"]);
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
    return this.payload.body.user.id;
  }

  async respond(blob) {
    if (this.payload.respond) {
      await this.payload.respond(blob);
      return;
    }
    const { text } = blob;
    await this.payload.client.chat.postEphemeral({
      channel: this.getChannel(),
      user: this.getUserId(),
      text,
    });
  }
}

module.exports = PayloadHelper;
