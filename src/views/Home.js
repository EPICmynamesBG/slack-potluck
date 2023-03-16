const DateTimeHelpers = require('../helpers/datetime');

class Home {
    constructor(app) {
        this._app = app;
    }

    async render(payload) {
        const { body } = payload;
        const { event } = body;

        await this._app.client.views.publish(Home.render(event.user));
    }

    static render(userId) {
        return {
            user_id: userId,
            view: {
                type: "home",
                blocks: [
                    {
                        type: "header",
                        block_id: DateTimeHelpers.unixFromDate(new Date()).toString(),
                        text: {
                            type: "plain_text",
                            text: "Welcome home!"
                        }
                    }
                ]
            }
        };
    }
}

module.exports = Home;
