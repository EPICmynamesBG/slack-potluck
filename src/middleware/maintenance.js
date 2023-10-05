const ErrorAssistant = require("../helpers/ErrorAssistant");
const getter = require("../helpers/getter");

class Maintenance {
    static Message = "Potluck is currently under maintenance. Please check back later";

    static async middleware(all) {
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
                text: this.Message
            });
        }
        await next();
    }

    static async errorHandler(all) {
        const { body, payload, client, context, logger, next } = all;
        try {
            await next();
        } catch (e) {
            logger.error(e);
            if (process.env.MAINTENANCE !== "true") {
                await (new ErrorAssistant(all)).handleError(e, this.Message);
                return;
            }
            throw e;
        }
    }

    static async processEventErrorHandler({ error, logger, request, response }) {
      logger.error(`[Unhandled]`, error);
      if (process.env.MAINTENANCE !== "true") {
        response.writeHead(503);
        response.write(this.Message);
        response.end();
        return true;  
      }
      // acknowledge it anyway!
      response.writeHead(200);
      response.end();
      return true;
    }
}

module.exports = Maintenance;
