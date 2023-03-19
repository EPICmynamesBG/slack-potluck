const db = require('../../models');
const CreateMeetupForm = require('../CreateMeetupModal/CreateMeetupForm');

class ManageMeetupModal {
    static VIEW_ID = 'meetup.manage.modal';
    static BLOCK_ID = 'meetup.manage.actions';
    static ACTIONS = {
        CANCEL_MEETUP: 'meetup.cancel'
    };

    constructor(app) {
        this._app = app;
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

        await this._app.client.views.open({
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
                text: `${dateOnly(meetup.timestamp)} Meetup`,
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

    static getFormValues() {
        // TODO
        return {
            
        };
    }

    static _deleteAction() {
        return [
            {
                type: 'actions',
                block_id: this.BLOCK_ID,
                elements: [
                    {
                        type: "button",
                        text: {
                          type: "plain_text",
                          text: "Cancel Meetup",
                        },
                        style: "danger",
                        value: meetup.id.toString(),
                        confirm: true,
                        action_id: this.ACTIONS.CANCEL_MEETUP,
                      }
                ]
            }
        ];
    }

    static render(meetup) {
        const blocks = CreateMeetupForm.render(meetup);
        blocks.add(...this._deleteAction());
        return blocks;
    }
}

module.exports = ManageMeetupModal;
