const getter = require("../helpers/getter");

module.exports = async function maintenance(all) {
    const { body, payload, client, context, next } = all;
    if (process.env.MAINTENANCE !== "true") {
        await next()
        return;
    }
    
    const slackUserId = getter(payload, 'user', 'user_id', 'user.id') ||
        getter(body, 'user_id', 'user.id');
    var maintenanceUsers = process.env.MAINTENANCE_USERS.split(',');
    if (!maintenanceUsers.includes(slackUserId)) {
        await client.chat.postEphemeral({
            channel: payload.channel || slackUserId,
            user: slackUserId,
            text: 'Potluck is currently under maintenance. Please check back later'
        });
    }
    await next();
};
