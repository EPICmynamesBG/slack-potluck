const Home = require('../views/Home');

let singleton;

class Events {
    constructor(app) {
        this._app = app;
        this._setup();
    }

    _setup() {
        this._app.event('app_home_opened', this.appHome.bind(this));
    }

    async appHome(payload) {
        const { body } = payload;
        const { event } = body;
        const slackTeamId = body.team_id;
        const slackUserId = event.user;
    
        const home = new Home(payload.client);
        await home.render(slackTeamId, slackUserId);
    }


    static init(app) {
        singleton = new Events(app);
    }

    static get() {
        return singleton;
    }
}

module.exports = Events;
