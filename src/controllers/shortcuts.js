const CreateMeetup = require('../services/CreateMeetup');
const NextMeetup = require('../services/NextMeetup');


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

        try {
            const result = await this._app.client.views.open(
                CreateMeetup.renderCreateForm(context.botToken, body.trigger_id)
            );
            console.log(result);
        }
        catch (error) {
            console.error(error);
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
