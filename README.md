# Slack-Potluck



## Version 1

### Features
[x] Schedule group meetups
[x] Sign up for food slots
[x] View Attendees/Signups
[x] Google Map Directions
[x] Announce meetups
[x] Manage (edit, delete) Meetups

## Future Versions
### Possible Features/Improvements
[ ] Render date-times in user's active TZ
[ ] Private Meetups
[ ] Calendar integration

## Development

## Dependencies
- Node.JS
- Docker
- ngrok.io (optional, recommended)

#### Sample .env
```
NODE_ENV=development
DEBUG=1
SLACK_APP_ID=
SLACK_CLIENT_ID=
SLACK_CLIENT_SECRET=
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_VERIFICATION_TOKEN=
DATABASE_CONNECTION_STRING="mysql://root:example@127.0.0.1/database_dev"
API_ENDPOINT_INTERACTIVE=/api/interactive
API_ENDPOINT_SELECT_OPTIONS=/api/select-options
API_ENDPOINT_EVENTS=/slack/events
```


## References
Logo Credits
<a href="https://www.flaticon.com/free-icons/human" title="human icons">Human icons created by Eucalyp - Flaticon</a>