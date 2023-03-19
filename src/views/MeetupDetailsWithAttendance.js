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
    static render(meetupWithRegistrationCount, renderForSlackUserId = undefined) {
        return [
            ...MeetupDetails.render(meetupWithRegistrationCount, renderForSlackUserId),
            ...MeetupAttendanceSection.render(meetupWithRegistrationCount),
            ...MeetupManagementActions.render(meetupWithRegistrationCount, renderForSlackUserId)
        ];
    }
}

module.exports = MeetupDetailsWithAttendance;
