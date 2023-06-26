// Require the Bolt package (github.com/slackapi/bolt)
const { App, HTTPReceiver } = require("@slack/bolt");
const dotenv = require("dotenv");
// load .env
dotenv.config();

const Views = require("./controllers/views");
const Commands = require('./controllers/commands');
const Shortcuts = require("./controllers/shortcuts");
const Actions = require("./controllers/actions");
const Events = require("./controllers/events");
const OAuthInstallationStore = require("./services/OAuthInstallationStore");
const { getInstance } = require('./helpers/logger');
const Maintenance = require("./middleware/maintenance");

const logger = getInstance('root');

const appOptions = {
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  scopes: [
    "app_mentions:read",
    "channels:join",
    "chat:write",
    "commands",
    "users:read",
  ],
  installerOptions: {
    directInstall: true
  },
  endpoints: [
    process.env.API_ENDPOINT_EVENTS,
    process.env.API_ENDPOINT_SELECT_OPTIONS,
    process.env.API_ENDPOINT_INTERACTIVE,
    process.env.API_ENDPOINT_COMMAND,
  ],
  developerMode: true,
  socketMode: false,
  installationStore: OAuthInstallationStore.get(),
  // authorize: OAuthInstallationStore.authorize.bind(OAuthInstallationStore),
  logger,
  logLevel: process.env.LOG_LEVEL || "info",
  customRoutes: [
    {
      path: '/health-check',
      method: ['GET'],
      handler: (req, res) => {
        res.writeHead(200);
        res.end('OK');
      },
    },
    {
      path: '/version',
      method: ['GET'],
      handler: (req, res) => {
        const pkg = require('../package.json');
        res.writeHead(200);
        res.write(pkg.version);
        res.end();
      }
    }
  ],
  extendedErrorHandler: !!process.env.DEBUG,
};

const app = new App({
  ...appOptions,
  receiver: new HTTPReceiver({
    ...appOptions,
    // more specific, focussed error handlers
    dispatchErrorHandler: async ({ error, logger: localLogger, response }) => {
      localLogger.error(`[404]`, error);
      response.writeHead(404);
      response.write("Something is wrong!");
      response.end();
    },
    processEventErrorHandler: Maintenance.processEventErrorHandler.bind(Maintenance),
    unhandledRequestHandler: async ({ logger: localLogger, response }) => {
      localLogger.debug('Auto-ack!');
      // acknowledge it anyway!
      response.writeHead(200);
      response.end();
    },
    unhandledRequestTimeoutMillis: 2000, // the default is 3001
  })
});

// All the room in the world for your code
// Interactive.init(app);
Actions.init(app);
Commands.init(app);
Events.init(app);
Shortcuts.init(app);
Views.init(app);

// global middlware
app.use(Maintenance.middleware);
app.use(Maintenance.errorHandler);

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  logger.info(`⚡️ App is running on port ${process.env.PORT || 3000}!`);
})();
