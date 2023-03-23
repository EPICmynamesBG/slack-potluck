const ErrorAssistant = require('../helpers/ErrorAssistant');
const CreateMeetup = require('../services/CreateMeetup');
const NextMeetup = require('../services/NextMeetup');
const CreateMeetupActions = require('../views/CreateMeetupActions');
const CreateMeetupModal = require('../views/CreateMeetupModal');


let singleton;

class Shortcuts {
    constructor(app) {
        this._app = app;
        this._setup();
    }

    _setup() {
        this._app.shortcut(CreateMeetupActions.ACTIONS.CREATE_MEETUP, this.meetupCreate.bind(this));
        this._app.shortcut('meetup.view.upcoming', this.viewUpcoming.bind(this));
    }

    async meetupCreate(payload) {
        const { ack, body, context } = payload;

        ack();

        const errorHelper = new ErrorAssistant(payload);
        try {
            const modal = new CreateMeetupModal(this._app);
            await modal.render({
                botToken: context.botToken,
                triggerId: body.trigger_id
            });
        }
        catch (error) {
            await errorHelper.handleError(error);
        }
    }

    async viewUpcoming(payload) {
        const { ack } = payload;
        ack();
        await NextMeetup.execute(this._app, payload);
    }

    static init(app) {
        singleton = new Shortcuts(app);
    }

    static get() {
        return singleton;
    }
}

module.exports = Shortcuts;
