# Slack-Potluck
A way to coordinate gatherings

**Notice: This application is intended for private distribution only. Use at your own risk**

<a href="https://slack.com/oauth/v2/authorize?client_id=3832577931127.4950891124451&scope=app_mentions:read,channels:join,chat:write,commands,users:read&user_scope="><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

## Version 1

### Features
- [x] Schedule group meetups
- [x] Sign up for food slots
- [x] View Attendees/Signups
- [x] Google Map Directions
- [x] Announce meetups
- [x] Manage (edit, delete) Meetups
- [x] OAuth2 multi-instance installation support

## Future Versions
### Possible Features/Improvements
- [ ] Render date-times in user's active TZ
- [ ] Private Meetups
- [ ] "Add to Calendar" integration
- [ ] Revise management UI to use Overflow menu element
- [ ] Separate general "Notes" option on the signup sheet (different from food item note)
- [ ] Multi-Select or list "Includes" feature for signup sheet to indicate that "My signup also includes Person A, B, C, where Person A may be another Slack user, but persons B, C may not be"

## Development

## Dependencies
- Node.JS
- Docker
- ngrok.io (optional, recommended)

#### Sample .env
```
NODE_ENV=development
DEBUG=1
LOG_LEVEL=debug
SLACK_APP_ID=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_VERIFICATION_TOKEN=
DATABASE_CONNECTION_STRING="mysql://root:example@127.0.0.1/database_dev"
API_ENDPOINT_INTERACTIVE=/slack/interactive
API_ENDPOINT_SELECT_OPTIONS=/slack/select-options
API_ENDPOINT_COMMAND=/slack/commands
API_ENDPOINT_EVENTS=/slack/events
ENCRYPTION_SECRET=
```


## References
Logo Credits
<a href="https://www.flaticon.com/free-icons/human" title="human icons">Human icons created by Eucalyp - Flaticon</a>
