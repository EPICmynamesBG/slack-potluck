const db = require('../../models');
const CreateMeetupForm = require('../CreateMeetupModal/CreateMeetupForm');
const { dateOnly } = require('../../helpers/datetime');

class ManageMeetupModal {
    static VIEW_ID = 'meetup.manage.modal';
    static ACTIONS = {
      ...CreateMeetupForm.ACTIONS
    };

    constructor(client) {
        this.client = client;
    }

    async render({
        botToken,
        triggerId,
        meetupId,
        channel,
        slackUserId,
        slackTeamId,    
    }) {
        const meetup = await db.Meetup.findByPk(meetupId);
        if (!meetup) {
            throw new Error('Meetup not found');
        }

        await this.client.views.open({
            token: botToken,
            trigger_id: triggerId,
            // Pass the view_id
            view_id: ManageMeetupModal.VIEW_ID,
            // View payload with updated blocks
            view: {
              type: "modal",
              // View identifier
              callback_id: ManageMeetupModal.VIEW_ID,
              notify_on_close: true,
              clear_on_close: true,
              private_metadata: JSON.stringify({
                meetupId,
                channel,
              }),
              title: {
                type: "plain_text",
                text: `Manage Meetup`,
              },
              submit:  {
                type: "plain_text",
                text: "Save Changes",
              },
              close: {
                type: "plain_text",
                text: "Close",
              },
              blocks: ManageMeetupModal.render(meetup),
            },
          });      
    }

    static getFormValues(viewState) {
        return CreateMeetupForm.getFormValues(viewState);
    }

    static render(meetup) {
        const blocks = CreateMeetupForm.render(meetup);
        return blocks;
    }
}

module.exports = ManageMeetupModal;
