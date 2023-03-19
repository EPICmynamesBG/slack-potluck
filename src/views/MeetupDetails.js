const DateTimeHelpers = require("../helpers/datetime");

class MeetupDetails {
  static ACTIONS = {
    GOOGLE_MAP_LINK_ACTION: 'meetup.location.url.click',
    MANAGE_MEETUP_ACTION: 'meetup.manage.modal.trigger'
  };
  //   constructor(app) {
  //     this._app = app;
  //   }

  //   async render(payload) {
  //     const { body } = payload;
  //     const { event } = body;

  //     await this._app.client.views.publish(Home.render(event.user));
  //   }

  static _renderMeetupAdditionalNotes(notes = null) {
    if (!notes) {
      return;
    }
    return {
      type: "section",
      fields: [
        {
          type: "mrkdwn",
          text: `:thought_balloon: ${notes}`,
        }
      ]
    };
  }

  /**
   *
   * @param {object} meetup
   * @param {string} [forSlackUserId]
   * @returns {object[]} blocks of meeting details
   */
  static render(meetup, forSlackUserId = undefined) {
    const formattedTime = DateTimeHelpers.humanReadable(meetup.timestamp);

    const addressUrl = new URL("https://www.google.com/maps/dir/?api=1");
    addressUrl.searchParams.set(
      "destination",
      meetup.locationAddress.replace("\n", ",")
    );
    const formattedLocation = meetup.locationAlias
      ? `*${meetup.locationAlias}*\n${meetup.locationAddress}`
      : meetup.locationAddress;

    const timeSection = {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:clock5: *${formattedTime}*`,
        }
      };
      if (meetup.isOrganizer(forSlackUserId)) {
        timeSection.accessory = {
          type: "button",
          action_id: this.ACTIONS.MANAGE_MEETUP_ACTION,
          text: {
            type: "plain_text",
            text: "Manage",
          },
          value: meetup.id.toString()
        }
      }

    const details = [
      timeSection,
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `:pushpin: ${formattedLocation}`,
        },
        accessory: {
          type: "button",
          action_id: this.ACTIONS.GOOGLE_MAP_LINK_ACTION,
          text: {
            type: "plain_text",
            text: "Directions",
          },
          url: addressUrl.toString(),
        },
      },
    ];
    if (meetup.additionalNotes) {
      details.push(this._renderMeetupAdditionalNotes(meetup.additionalNotes));
    }
    if (meetup.includeFoodSignup) {
      details.push({
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "Please bring :shallow_pan_of_food: :yum:",
          },
        ],
      });
    }
    return details;
  }
}

module.exports = MeetupDetails;
