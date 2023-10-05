const MeetupWithRegistrationCount = require('../models/views/MeetupWithRegistrationCount');
const MeetupAttendanceSection = require('./MeetupAttendanceSection');
const MeetupDetails = require('./MeetupDetails');
const AnnounceMeetupActions = require("./AnnounceMeetupActions");
const MeetupManagementActions = require('./MeetupManagementActions');

class MeetupDetailsWithAttendance {
    static ATTENDANCE_BLOCK_ID = MeetupAttendanceSection.ATTENDANCE_BLOCK_ID;
    static ACTIONS = {
        ...MeetupAttendanceSection.ACTIONS 
    };

    /**
     * @param {MeetupWithRegistrationCount} meetupWithRegistrationCount 
     */
    static render(meetupWithRegistrationCount, slackUserContext = {}) {
        return [
            ...MeetupDetails.render(meetupWithRegistrationCount, slackUserContext),
            ...MeetupAttendanceSection.render(meetupWithRegistrationCount),
            ...MeetupManagementActions.render(meetupWithRegistrationCount, slackUserContext)
        ];
    }
}

module.exports = MeetupDetailsWithAttendance;
