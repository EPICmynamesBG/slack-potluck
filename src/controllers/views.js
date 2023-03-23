const _ = require("lodash");
const CreateMeetup = require("../services/CreateMeetup");
const ErrorAssistant = require("../helpers/ErrorAssistant");
const FoodSignup = require("../services/FoodSignup");
const MeetupRegistration = require("../services/MeetupRegistration");
const MeetupScheduledResponse = require("../views/MeetupScheduledResponse");
const CreateMeetupModal = require("../views/CreateMeetupModal");
const RegistrationModal = require("../views/RegistrationModal");
const ViewAttendanceModal = require("../views/ViewAttendanceModal");
const ManageMeetupModal = require("../views/ManageMeetupModal");
const UpdateMeetup = require("../services/UpdateMeetup");
const PayloadHelper = require('../helpers/PayloadHelper');
const Home = require('../views/Home');

let singleton;

class Views {
  constructor(app) {
    this._app = app;
    this._setup();
  }

  _setup() {
    this._app.view(
      CreateMeetupModal.VIEW_ID,
      this.createMeetupSubmit.bind(this)
    );
    this._app.view(
      { callback_id: CreateMeetupModal.VIEW_ID, type: "view_closed" },
      this.emptyAck.bind(this)
    );

    this._app.view(
      RegistrationModal.VIEW_ID,
      this.registrationModalSubmit.bind(this)
    );
    this._app.view(
      { callback_id: RegistrationModal.VIEW_ID, type: "view_closed" },
      this.registrationSignupClosed.bind(this)
    );

    this._app.view(
      { callback_id: ViewAttendanceModal.VIEW_ID, type: "view_closed" },
      this.emptyAck.bind(this)
    );
    this._app.view(ViewAttendanceModal.VIEW_ID, this.emptyAck.bind(this));

    this._app.view(
      { callback_id: ManageMeetupModal.VIEW_ID, type: "view_closed" },
      this.emptyAck.bind(this)
    );
    this._app.view(
      ManageMeetupModal.VIEW_ID,
      this.submitMeetupChanges.bind(this)
    );
  }

  async emptyAck({ ack }) {
    ack();
  }

  async createMeetupSubmit(payload) {
    const { ack, body, view } = payload;
    ack();
    const helper = new ErrorAssistant(payload);

    let meetup;
    try {
      meetup = await CreateMeetup.execute(
        view.state,
        body.user.id,
        view.team_id
      );
    } catch (e) {
      await helper.handleError(
        e,
        "Something went wrong and the meetup could not be created :disappointed:"
      );
      return;
    }
    try {
      await this._app.client.chat.postMessage({
        channel: body.user.id,
        unfurl_links: false,
        blocks: MeetupScheduledResponse.render(meetup),
      });
    } catch (e) {
      await helper.handleError(
        e,
        "Meetup created, but something went wrong preparing the announcement :thinking_face:"
      );
    }
    await this._reRenderHome(payload);
  }

  async registrationModalSubmit(payload) {
    const { ack, body, view } = payload;
    ack();

    const helper = new ErrorAssistant(payload);
    try {
      await MeetupRegistration.updateAttendance(this._app, payload);
      await FoodSignup.recordResponse(this._app, payload);
    } catch (e) {
      await helper.handleError(e);
    }
    const meta = JSON.parse(_.get(view, "private_metadata", "{}"));
    const { channel = body.user.id } = meta;

    await this._app.client.chat.postEphemeral({
      channel: channel,
      user: body.user.id,
      text: "You're going, hooray! :simple_smile:",
    });
  }

  async registrationSignupClosed(payload) {
    const { ack, body, view } = payload;
    ack();
    const meta = JSON.parse(_.get(view, "private_metadata", "{}"));
    const { channel = body.user.id } = meta;

    await this._app.client.chat.postEphemeral({
      channel: channel,
      user: body.user.id,
      text: "You're going, hooray! You can always hit Sign Up again to update details :simple_smile:",
    });
  }

  async submitMeetupChanges(payload) {
    const { ack } = payload;
    ack();

    try {
      await UpdateMeetup.execute(this._app, payload);
    } catch (e) {
      const errAssistant = new ErrorAssistant(payload);
      await errAssistant.handleError(
        e,
        "Something went wrong trying to update the Meetup"
      );
    }
    await this._reRenderHome(payload);
  }

  async _reRenderHome(payload) {
    const { body } = payload;
    const errorHelper = new ErrorAssistant(payload);
    try {
      const payloadHelper = new PayloadHelper(payload);
      const home = new Home(payload.client);
      await home.render(body.user.team_id, payloadHelper.getUserId());
    } catch (e) {
      await errorHelper.handleError(e, "Failed to re-render app Home");
    }
  }

  static init(app) {
    singleton = new Views(app);
  }

  static get() {
    return singleton;
  }
}

module.exports = Views;
