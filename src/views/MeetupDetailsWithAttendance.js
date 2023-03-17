const MeetupWithRegistrationCount = require('../models/views/MeetupWithRegistrationCount');
const MeetupAttendanceSection = require('./MeetupAttendanceSection');
const MeetupDetails = require('./MeetupDetails');

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
            ...MeetupAttendanceSection.render(meetupWithRegistrationCount)
        ];
    }
}

module.exports = MeetupDetailsWithAttendance;
