// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
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
const maintenance = require("./middleware/maintenance");

const logger = getInstance('root');

const app = new App({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
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
  authorize: OAuthInstallationStore.authorize.bind(OAuthInstallationStore),
  stateSecret: process.env.SLACK_STATE_SECRET,
  logger,
  logLevel: process.env.LOG_LEVEL || "info"
});

// All the room in the world for your code
// Interactive.init(app);
Actions.init(app);
Commands.init(app);
Events.init(app);
Shortcuts.init(app);
Views.init(app);

// global middlware
app.use(maintenance);

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  logger.info(`⚡️ App is running on port ${process.env.PORT || 3000}!`);
})();
