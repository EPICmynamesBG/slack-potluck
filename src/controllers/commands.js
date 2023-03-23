const ErrorAssistant = require("../helpers/ErrorAssistant");
const CreateMeetup = require("../services/CreateMeetup");
const NextMeetup = require("../services/NextMeetup");
const CreateMeetupActions = require("../views/CreateMeetupActions");
const CreateMeetupModal = require("../views/CreateMeetupModal");

let singleton;

class Commands {
  constructor(app) {
    this._app = app;
    this._setup();
  }

  _setup() {
    this._app.command("/meetup", this.meetupCmd.bind(this));
  }

  static MEETUP_SUBCOMMANDS = {
    "": "_viewUpcoming",
    create: "_createMeetup",
  };

  static parse(text) {
    if (Commands.MEETUP_SUBCOMMANDS[text]) {
      return text;
    }
    return null;
  }

  async meetupCmd(payload) {
    const { ack, body, respond, say } = payload;

    ack();

    const command = Commands.parse(body.text);
    if (command === null) {
      await say(
        "I'm not sure what to do with that. Please try the command without input to view the next schedule meetup, or with `create` to create a meetup."
      );
      return;
    }
    const method = Commands.MEETUP_SUBCOMMANDS[command];
    await this[method](payload);
  }

  async _createMeetup(payload) {
    const { body, client, context } = payload;
    const errorHelper = new ErrorAssistant(payload);
    try {
      const modal = new CreateMeetupModal(client);
      await modal.render({
        botToken: context.botToken,
        triggerId: body.trigger_id,
      });
    } catch (error) {
      await errorHelper.handleError(error);
    }
  }

  async _viewUpcoming(payload) {
    await NextMeetup.execute(payload);
  }

  static init(app) {
    singleton = new Commands(app);
  }

  static get() {
    return singleton;
  }
}

module.exports = Commands;
