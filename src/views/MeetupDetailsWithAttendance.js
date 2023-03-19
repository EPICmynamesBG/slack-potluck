const MeetupWithRegistrationCount = require('../models/views/MeetupWithRegistrationCount');
const MeetupAttendanceSection = require('./MeetupAttendanceSection');
const MeetupDetails = require('./MeetupDetails');
const AnnounceMeetupActions = require("./AnnounceMeetupActions");

class MeetupDetailsWithAttendance {
    static ATTENDANCE_BLOCK_ID = MeetupAttendanceSection.ATTENDANCE_BLOCK_ID;
    static ACTIONS = {
        ...MeetupAttendanceSection.ACTIONS 
    };

    /**
     * @param {MeetupWithRegistrationCount} meetupWithRegistrationCount 
     */
    static render(meetupWithRegistrationCount) {
        return [
            ...MeetupDetails.render(meetupWithRegistrationCount),
            ...MeetupAttendanceSection.render(meetupWithRegistrationCount),
            ...AnnounceMeetupActions.render(meetupWithRegistrationCount, false)
        ];
    }
}

module.exports = MeetupDetailsWithAttendance;
