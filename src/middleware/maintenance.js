
module.exports = async function maintenance({ payload, client, context, next }) {
    if (process.env.MAINTENANCE !== "true") {
        await next()
        return;
    }
    
    const slackUserId = payload.user;
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
