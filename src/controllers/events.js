const Home = require('../views/Home');
const OAuthInstallationStore = require('../services/OAuthInstallationStore');

let singleton;

class Events {
    constructor(app) {
        this._app = app;
        this._setup();
    }

    _setup() {
        this._app.event('app_home_opened', this.appHome.bind(this));
        this._app.event('app_uninstalled', this.appUninstalled.bind(this));
    }

    async appHome(payload) {
        const { body } = payload;
        const { event } = body;
        const slackTeamId = body.team_id;
        const slackUserId = event.user;
    
        const home = new Home(payload.client);
        await home.render(slackTeamId, slackUserId);
    }

    async appUninstalled(payload) {
        const { body, context } = payload;
        const store = OAuthInstallationStore.get();
        /**
         * @type {import('@slack/bolt').InstallationQuery}
         */
        const query = {
            teamId: body.team_id,
            enterpriseId: context.enterpriseId,
            userId: context.userId,
            conversationId: context.conversationId,
            isEnterpriseInstall: context.isEnterpriseInstall
        };
        await store.deleteInstallation(query, this._app.logger);
    }


    static init(app) {
        singleton = new Events(app);
    }

    static get() {
        return singleton;
    }
}

module.exports = Events;
