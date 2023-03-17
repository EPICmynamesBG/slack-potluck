const ErrorAssistant = require('../helpers/ErrorAssistant');
const CreateMeetup = require('../services/CreateMeetup');
const NextMeetup = require('../services/NextMeetup');
const CreateMeetupModal = require('../views/CreateMeetupModal');


let singleton;

class Shortcuts {
    constructor(app) {
        this._app = app;
        this._setup();
    }

    _setup() {
        this._app.shortcut('meetup.create', this.meetupCreate.bind(this));
        this._app.shortcut('meetup.view.upcoming', this.viewUpcoming.bind(this));
    }

    async meetupCreate(payload) {
        const { ack, body, context } = payload;

        ack();

        const errorHelper = new ErrorAssistant(this._app, payload);
        try {
            const renderer = new CreateMeetupModal();
            const modal = await renderer.render({
                botToken: context.botToken,
                triggerId: body.trigger_id
            })
            const result = await this._app.client.views.open(
                modal
            );
        }
        catch (error) {
            errorHelper.handleError(error);
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
