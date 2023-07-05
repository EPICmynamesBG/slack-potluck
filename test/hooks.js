const db = require('../src/models');
const ErrorAssistant = require('../src/helpers/ErrorAssistant');

const sandbox = sinon.createSandbox();

module.exports = {
    /**
     * Generate fake
     * @returns {import("@slack/bolt").App}
     */
    useApp: function () {
        const mockApp = {
            action: sinon.fake()
        };
        return mockApp;
    },
    useClient: function (overrides = {}) {
        return {
            chat: {
                postMessage: sinon.fake.returns(Promise.resolve())
            },
            conversations: {
                join: sinon.fake.returns(Promise.resolve())
            },
            views: {
                open: sinon.fake.returns(Promise.resolve())
            }
        };
    },
    useUser: function (overrides = {}) {
        return {
            id: 'U1',
            team_id: 'T1',
            ...overrides
        };
    },
    useBody: function (overrides = {}) {
        return {
            channel: {
                id:' C1'
            },
            ...overrides,
            user: this.useUser(overrides.user),
        }
    },
    useContext: function (overrides = {}) {
        return {
            ...overrides
        };
    },
    usePayload: function (overrides = {}) {
        return {
            ack: sinon.fake(),
            action: {
                value: 'TEST'
            },
            ...overrides,
            context: this.useContext(overrides.context),
            body: this.useBody(overrides.body),
            client: this.useClient(overrides.client),
        };
    },
    useMeetup: async function useMeetup(overrides = {}) {
        var meetup = await db.Meetup.create({
            timestamp: new Date(),
            locationAddress: "1234 West Street",
            locationAlias: "Bob's House",
            createdBy: "U1",
            slackTeamId: "T1",
            includeFoodSignup: true,
            additionalNotes: null,      
            ...overrides
        });
        return meetup;
    },
    /**
     * Overrides ErrorAssistant to force invocations to cause test failing exceptiosn
     */
    useErrorAssistantStub: function useErrorAssistantStub() {
        sandbox.stub(ErrorAssistant.prototype, 'handleError').callsFake((e, ...args) => {
            throw e;
        });
    },
    restoreErrorAssistantStub: function resetErrorAssistantStub() {
        sandbox.restore();
    }
}