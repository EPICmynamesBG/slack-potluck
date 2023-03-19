const ErrorAssistant = require("../helpers/ErrorAssistant");
const PayloadHelper = require("../helpers/PayloadHelper");
const AnnounceMeetup = require("../services/AnnounceMeetup");
const FoodSignup = require("../services/FoodSignup");
const MeetupRegistration = require("../services/MeetupRegistration");
const CreateMeetupModal = require("../views/CreateMeetupModal");
const ManageMeetupModal = require("../views/ManageMeetupModal");
const MeetupDetails = require("../views/MeetupDetails");
const MeetupDetailsWithAttendance = require("../views/MeetupDetailsWithAttendance");
const MeetupScheduledResponse = require("../views/MeetupScheduledResponse");
const QuickRegistrationActions = require("../views/QuickRegistrationActions");
const RegistrationModal = require("../views/RegistrationModal");
const ViewAttendanceModal = require("../views/ViewAttendanceModal");

let singleton;

class Actions {
  constructor(app) {
    this._app = app;
    this._setup();
  }

  _setup() {
    this._app.action(
      MeetupScheduledResponse.ACTIONS.CHANNEL_SELECT_ACTION,
      this.emptyAck.bind(this)
    );
    this._app.action(
      MeetupScheduledResponse.ACTIONS.IGNORE_ANNOUNCE_ACTION,
      this.announceMeetupHandler.bind(this)
    );
    this._app.action(
      MeetupScheduledResponse.ACTIONS.SUBMIT_ANNOUNCE_ACTION,
      this.announceMeetupHandler.bind(this)
    );
    this._app.action(
      MeetupDetails.ACTIONS.GOOGLE_MAP_LINK_ACTION,
      this.emptyAck.bind(this)
    );
    this._app.action(
      CreateMeetupModal.ACTIONS.CREATE_MEETUP_INCLUDE_FOOD_SIGNUP,
      this.emptyAck.bind(this)
    );
    this._app.action(
      CreateMeetupModal.ACTIONS.CREATE_MEETUP_WHEN,
      this.emptyAck.bind(this)
    );
    this._app.action(
      CreateMeetupModal.ACTIONS.CREATE_MEETUP_WHERE_ADDRESS,
      this.emptyAck.bind(this)
    );
    this._app.action(
      CreateMeetupModal.ACTIONS.CREATE_MEETUP_WHERE_FRIENDLY,
      this.emptyAck.bind(this)
    );
    this._app.action(
      CreateMeetupModal.ACTIONS.CREATE_MEETUP_ADDITIONAL_NOTES,
      this.emptyAck.bind(this)
    );
    this._app.action(
      RegistrationModal.ACTIONS.FOOD_TYPE_SELECT,
      this.emptyAck.bind(this)
    );
    this._app.action(
      RegistrationModal.ACTIONS.FOOD_DESCRIPTION,
      this.emptyAck.bind(this)
    );
    this._app.action(
      RegistrationModal.ACTIONS.ADULT_SIGNUP,
      this.emptyAck.bind(this)
    );
    this._app.action(
      RegistrationModal.ACTIONS.CHILD_SIGNUP,
      this.emptyAck.bind(this)
    );
    this._app.action(
      QuickRegistrationActions.ACTIONS.SIGNUP,
      this.userSignupForMeetup.bind(this)
    );
    this._app.action(
      QuickRegistrationActions.ACTIONS.NOT_ATTENDING,
      this.userUnableToAttendMeetup.bind(this)
    );
    this._app.action(
      MeetupDetailsWithAttendance.ACTIONS.VIEW_ATTENDANCE,
      this.viewAttendanceTrigger.bind(this)
    );
    this._app.action(
      MeetupDetails.ACTIONS.MANAGE_MEETUP_ACTION,
      this.manageMeetupTrigger.bind(this)
    );
    this._app.action(
      ManageMeetupModal.ACTIONS.CANCEL_MEETUP,
      this.cancelMeetup.bind(this)
    );
  }

  async emptyAck({ ack }) {
    ack();
  }

  async announceMeetupHandler(payload) {
    const { ack, action } = payload;
    ack();

    if (
      action.action_id ===
      MeetupScheduledResponse.ACTIONS.IGNORE_ANNOUNCE_ACTION
    ) {
      await AnnounceMeetup.ignore(payload);
    } else if (
      action.action_id ===
      MeetupScheduledResponse.ACTIONS.SUBMIT_ANNOUNCE_ACTION
    ) {
      await AnnounceMeetup.announce(this._app, payload);
    }
    // else nothing to be concerned with
  }

  async userSignupForMeetup(payload) {
    const { ack } = payload;
    ack();

    await MeetupRegistration.initAttending(this._app, payload);
    await this._app.client.views.open(
      await FoodSignup.renderSignupModal(payload)
    );
  }

  async userUnableToAttendMeetup(payload) {
    const { ack } = payload;
    ack();

    await MeetupRegistration.notAttending(this._app, payload);
  }

  async viewAttendanceTrigger(payload) {
    // TODO: Open modal
    const { ack } = payload;
    ack();

    const payloadHelper = new PayloadHelper(payload);
    const { action, context, body } = payload;
    const errorHelper = new ErrorAssistant(this._app, payload);
    const modal = new ViewAttendanceModal(this._app);
    try {
      await modal.render({
        channel: payloadHelper.getChannel(),
        botToken: context.botToken,
        triggerId: body.trigger_id,
        meetupId: action.value,
        slackUserId: body.user.id,
        slackTeamId: body.user.team_id,
      });
    } catch (e) {
      await errorHelper.handleError(e);
    }
  }

  async manageMeetupTrigger(payload) {
    const { ack } = payload;
    ack();

    const payloadHelper = new PayloadHelper(payload);
    const { action, context, body } = payload;
    const errorHelper = new ErrorAssistant(this._app, payload);
    const modal = new ManageMeetupModal(this._app);
    try {
      await modal.render({
        channel: payloadHelper.getChannel(),
        botToken: context.botToken,
        triggerId: body.trigger_id,
        meetupId: action.value,
        slackUserId: body.user.id,
        slackTeamId: body.user.team_id,
      });
    } catch (e) {
      await errorHelper.handleError(e);
    }    
  }

  async cancelMeetup(payload) {
    const { ack } = payload;
    ack();
    // TODO
  }

  static init(app) {
    singleton = new Actions(app);
  }

  static get() {
    return singleton;
  }
}

module.exports = Actions;
