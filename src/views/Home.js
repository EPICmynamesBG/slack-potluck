const DateTimeHelpers = require('../helpers/datetime');

class Home {
    constructor(app) {
        this._app = app;
    }

    async render(payload) {
        const { body } = payload;
        const { event } = body;

        await this._app.client.views.publish({
            user_id: event.user,
            team_id: event.team,
            view: {
                type: "home",
                blocks: Home.render()
            }
        });
    }

    static render() {
        return [
            {
                type: "header",
                block_id: DateTimeHelpers.unixFromDate(new Date()).toString(),
                text: {
                    type: "plain_text",
                    text: "Welcome home!"
                }
            }
        ];
    }
}

module.exports = Home;
