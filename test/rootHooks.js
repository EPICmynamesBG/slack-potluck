const db = require('../src/models');

module.exports = {
    mochaHooks: {
        afterEach: [
            async function truncateDb() {
                await db.Meetup.destroy({
                    where: {},
                    force: true
                });
                await db.OAuthInstallation.destroy({
                    where: {},
                    force: true
                });
            }
        ]
    }
}