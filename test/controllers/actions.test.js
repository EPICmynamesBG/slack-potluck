const { describe, it, before, after } = require('mocha');
const assert = require('node:assert');
// const { useApp } = require('../hooks');

const Actions = require('../../src/controllers/actions');


describe('actions', () => {
    before(useErrorAssistantStub);
    after(restoreErrorAssistantStub);

    describe('userSignupForMeetup', () => {
        
        it('basic success check', async () => {
            const meetup = await useMeetup();
            const app = useApp();
            const a = new Actions(app);
            const payload = usePayload({
                action: {
                    value: meetup.id
                }
            });
            await a.userSignupForMeetup(payload);
            sinon.assert.calledOnce(payload.client.views.open);
        });
    });

    describe('viewAttendanceTrigger', () => {
        
        it('basic success check', async () => {
            const meetup = await useMeetup();
            const app = useApp();
            const a = new Actions(app);
            const payload = usePayload({
                action: {
                    value: meetup.id
                }
            });
            await a.viewAttendanceTrigger(payload);
            sinon.assert.calledOnce(payload.client.views.open);
        });
    });
});
