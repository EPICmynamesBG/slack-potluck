const _ = require('lodash');
const CreateMeetup = require('../services/CreateMeetup');
const ErrorAssistant = require('../helpers/ErrorAssistant');
const FoodSignup = require('../services/FoodSignup');
const MeetupRegistration = require('../services/MeetupRegistration');

let singleton;

class Views {
    constructor(app) {
        this._app = app;
        this._setup();
    }

    _setup() {
        this._app.view(CreateMeetup.VIEW_ID, this.createMeetupSubmit.bind(this));
        this._app.view(FoodSignup.VIEW_ID, this.foodSignupSubmit.bind(this));
        this._app.view({ callback_id: FoodSignup.VIEW_ID, type: 'view_closed' }, this.foodSignupClosed.bind(this));
    }

    async createMeetupSubmit(payload) {
        const { ack, body, view } = payload;
        ack();
        const helper = new ErrorAssistant(this._app, payload);

        let meetup;
        try {
            meetup = await CreateMeetup.execute(view.state, body.user.id, view.team_id);
        } catch(e) {
            await helper.handleError(e, 'Something went wrong and the meetup could not be created :disappointed:');
            return;
        }
        try {
            await this._app.client.chat.postMessage({
                channel: body.user.id,
                unfurl_links: false,
                blocks: CreateMeetup.renderMeetupCreatedMessage(meetup)
            });
        } catch (e) {
            await helper.handleError(e, 'Meetup created, but something went wrong preparing the announcement :thinking_face:');
        }
    }

    async foodSignupSubmit(payload) {
        const { ack, body, view } = payload;
        ack();

        const helper = new ErrorAssistant(this._app, payload);
        try {
            await MeetupRegistration.updateAttendance(this._app, payload);
            await FoodSignup.recordResponse(this._app, payload);    
        } catch (e) {
            await helper.handleError(e);
        }
        const meta = JSON.parse(_.get(view, 'private_metadata', '{}'));
        const { channel = body.user.id } = meta;

        await this._app.client.chat.postEphemeral({
            channel: channel,
            user: body.user.id,
            text: "You're going, hooray! :simple_smile:"
        });
    }

    async foodSignupClosed(payload) {
        const { ack, body, view } = payload;
        ack();
        const meta = JSON.parse(_.get(view, 'private_metadata', '{}'));
        const { channel = body.user.id } = meta;

        await this._app.client.chat.postEphemeral({
            channel: channel,
            user: body.user.id,
            text: "You're going, hooray! You can always hit Sign Up again to update details :simple_smile:"
        });
    }

    static init(app) {
        singleton = new Views(app);
    }

    static get() {
        return singleton;
    }
}

module.exports = Views;
