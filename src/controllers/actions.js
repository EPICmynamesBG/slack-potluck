const AnnounceMeetup = require("../services/AnnounceMeetup");
const CreateMeetup = require("../services/CreateMeetup");
const FoodSignup = require("../services/FoodSignup");
const MeetupRegistration = require("../services/MeetupRegistration");
const CreateMeetupModal = require("../views/CreateMeetupModal");
const MeetupDetails = require("../views/MeetupDetails");
const MeetupScheduledResponse = require("../views/MeetupScheduledResponse");
const QuickRegistrationActions = require("../views/QuickRegistrationActions");
const RegistrationModal = require("../views/RegistrationModal");

let singleton;

class Actions {
    constructor(app) {
        this._app = app;
        this._setup();
    }

    _setup() {
        this._app.action(MeetupScheduledResponse.ACTIONS.CHANNEL_SELECT_ACTION, this.emptyAck.bind(this));
        this._app.action(MeetupScheduledResponse.ACTIONS.IGNORE_ANNOUNCE_ACTION, this.announceMeetupHandler.bind(this));
        this._app.action(MeetupScheduledResponse.ACTIONS.SUBMIT_ANNOUNCE_ACTION, this.announceMeetupHandler.bind(this));
        this._app.action(MeetupDetails.ACTIONS.GOOGLE_MAP_LINK_ACTION, this.emptyAck.bind(this));
        this._app.action(CreateMeetupModal.ACTIONS.CREATE_MEETUP_INCLUDE_FOOD_SIGNUP, this.emptyAck.bind(this));
        this._app.action(CreateMeetupModal.ACTIONS.CREATE_MEETUP_WHEN, this.emptyAck.bind(this));
        this._app.action(CreateMeetupModal.ACTIONS.CREATE_MEETUP_WHERE_ADDRESS, this.emptyAck.bind(this));
        this._app.action(CreateMeetupModal.ACTIONS.CREATE_MEETUP_WHERE_FRIENDLY, this.emptyAck.bind(this));
        this._app.action(CreateMeetupModal.ACTIONS.CREATE_MEETUP_ADDITIONAL_NOTES, this.emptyAck.bind(this));
        this._app.action(RegistrationModal.ACTIONS.FOOD_TYPE_SELECT, this.emptyAck.bind(this));
        this._app.action(RegistrationModal.ACTIONS.FOOD_DESCRIPTION, this.emptyAck.bind(this));
        this._app.action(RegistrationModal.ACTIONS.ADULT_SIGNUP, this.emptyAck.bind(this));
        this._app.action(RegistrationModal.ACTIONS.CHILD_SIGNUP, this.emptyAck.bind(this));
        this._app.action(QuickRegistrationActions.ACTIONS.SIGNUP, this.userSignupForMeetup.bind(this));
        this._app.action(QuickRegistrationActions.ACTIONS.NOT_ATTENDING, this.userUnableToAttendMeetup.bind(this));
    }

    async emptyAck({ ack }) {
        ack();
    }

    async createMeetup(payload) {
        const { ack, body, context } = payload;
        ack();
        return;
    }

    async announceMeetupHandler(payload) {
        const { ack, action } = payload;
        ack();

        if (action.action_id === MeetupScheduledResponse.ACTIONS.IGNORE_ANNOUNCE_ACTION) {
            await AnnounceMeetup.ignore(payload);
        } else if (action.action_id === MeetupScheduledResponse.ACTIONS.SUBMIT_ANNOUNCE_ACTION) {
            await AnnounceMeetup.announce(this._app, payload);
        }
        // else nothing to be concerned with
    }

    async userSignupForMeetup(payload) {
        const { ack} = payload;
        ack();

        await MeetupRegistration.initAttending(this._app, payload);
        await this._app.client.views.open(
            await FoodSignup.renderSignupModal(payload)
        )
    }

    async userUnableToAttendMeetup(payload) {
        const { ack } = payload;
        ack();

        await MeetupRegistration.notAttending(this._app, payload);
    }

    static init(app) {
        singleton = new Actions(app);
    }

    static get() {
        return singleton;
    }
}

module.exports = Actions;
