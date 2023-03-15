const AnnounceMeetup = require("../services/AnnounceMeetup");

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
        // this._app.action({ callback_id: 'meetup.create' }, this.createMeetup.bind(this));
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
            await AnnounceMeetup.announce(payload);
        }
        // else nothing to be concerned with
    }

    static init(app) {
        singleton = new Actions(app);
    }

    static get() {
        return singleton;
    }
}

module.exports = Actions;
