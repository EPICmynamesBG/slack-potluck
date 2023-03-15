// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");
const dotenv = require('dotenv');
// load .env
dotenv.config();

// require('./config/db').init();

const Views = require('./controllers/views');
const Shortcuts = require('./controllers/shortcuts');
const Actions = require('./controllers/actions');


const app = new App({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  endpoints: ['/slack/events', process.env.API_ENDPOINT_INTERACTIVE, process.env.API_ENDPOINT_SELECT_OPTIONS],
  developerMode: true,
  socketMode: false
});


// All the room in the world for your code
// Interactive.init(app);
Actions.init(app);
Shortcuts.init(app);
Views.init(app);


(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();