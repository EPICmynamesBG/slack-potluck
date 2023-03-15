const CreateMeetup = require('../services/CreateMeetup');


let singleton;

class Views {
    constructor(app) {
        this._app = app;
        this._setup();
    }

    _setup() {
        this._app.view(CreateMeetup.VIEW_ID, this.createMeetupSubmit.bind(this));
    }

    async createMeetupSubmit(payload) {
        const { ack, body, view, context } = payload;
        ack();
        const meetup = await CreateMeetup.execute(view.state, body.user.id, view.team_id);
        await this._app.client.chat.postMessage({
            channel: body.user.id,
            unfurl_links: false,
            blocks: CreateMeetup.renderMeetupCreatedMessage(meetup)
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
