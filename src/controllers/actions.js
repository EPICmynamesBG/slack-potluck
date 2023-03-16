const AnnounceMeetup = require("../services/AnnounceMeetup");
const CreateMeetup = require("../services/CreateMeetup");
const FoodSignup = require("../services/FoodSignup");
const MeetupRegistration = require("../services/MeetupRegistration");

let singleton;

class Actions {
    constructor(app) {
        this._app = app;
        this._setup();
    }

    _setup() {
        this._app.action(AnnounceMeetup.ChannelSelectAction, this.announceMeetupHandler.bind(this));
        this._app.action(AnnounceMeetup.IgnoreAnnounceAction, this.announceMeetupHandler.bind(this));
        this._app.action(AnnounceMeetup.SubmitAnnounceAction, this.announceMeetupHandler.bind(this));
        this._app.action(AnnounceMeetup.GoogleMapLinkAction, this.emptyAck.bind(this));
        this._app.action(CreateMeetup.ACTIONS.CREATE_MEETUP_INCLUDE_FOOD_SIGNUP, this.emptyAck.bind(this));
        this._app.action(CreateMeetup.ACTIONS.CREATE_MEETUP_WHEN, this.emptyAck.bind(this));
        this._app.action(CreateMeetup.ACTIONS.CREATE_MEETUP_WHERE_ADDRESS, this.emptyAck.bind(this));
        this._app.action(CreateMeetup.ACTIONS.CREATE_MEETUP_WHERE_FRIENDLY, this.emptyAck.bind(this));
        this._app.action(CreateMeetup.ACTIONS.CREATE_MEETUP_ADDITIONAL_NOTES, this.emptyAck.bind(this));
        this._app.action(FoodSignup.ACTIONS.FOOD_TYPE_SELECT, this.emptyAck.bind(this));
        this._app.action(FoodSignup.ACTIONS.FOOD_DESCRIPTION, this.emptyAck.bind(this));
        this._app.action(FoodSignup.ACTIONS.SIGNUP, this.userSignupForMeetup.bind(this));
        this._app.action(FoodSignup.ACTIONS.NOT_ATTENDING, this.userUnableToAttendMeetup.bind(this));
    }

    async emptyAck({ ack }) {
        ack();
    }

    async createMeetup(payload) {
        console.log('createMeetup');
        const { ack, body, context } = payload;
        ack();
        return;
    }

    async announceMeetupHandler(payload) {
        const { ack, action } = payload;
        ack();

        if (action.action_id === AnnounceMeetup.IgnoreAnnounceAction) {
            await AnnounceMeetup.ignore(payload);
        } else if (action.action_id === AnnounceMeetup.SubmitAnnounceAction) {
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
