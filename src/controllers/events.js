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
        const { event, client, logger } = payload;
        // ack();

        const home = new Home(this._app);
        await home.render(payload);
    }


    static init(app) {
        singleton = new Events(app);
    }

    static get() {
        return singleton;
    }
}

module.exports = Events;
