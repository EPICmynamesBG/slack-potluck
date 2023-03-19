const MeetupDetails = require('../MeetupDetails');

class MeetupUpdatedEphemeral {
    static render(meetup) {
        return [
            {
                type: "section",
                text: {
                  type: "plain_text",
                  text: "Meeting Updated!",
                },
              },
            ...MeetupDetails.render(meetup),
            {
                type: "context",
                elements: [
                    {
                        type: "plain_text",
                        text: "*Existing announcements will automatically update in 5 minutes from your last edit.",
                      }
                ],
            }
        ];
    }
}

module.exports = MeetupUpdatedEphemeral;
