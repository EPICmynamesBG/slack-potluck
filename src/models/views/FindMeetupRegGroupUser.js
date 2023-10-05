const { QueryTypes, DataTypes } = require('sequelize');
const db = require('../index');
const _ = require('lodash');

class FindMeetupRegGroupUser {
    static async ByInclusion({ meetupId, slackTeamId, forUser }) {
        var matches = await db.sequelize.query(
            `
            SELECT meetup_registration_group_users.*
            FROM meetup_registration_group_users
            JOIN meetup_registrations ON (meetup_registration_group_users.meetup_registration_id = meetup_registrations.id)
            WHERE meetup_registrations.slack_team_id = ?
              AND meetup_registrations.meetup_id = ?
              AND meetup_registration_group_users.grouped_slack_user_id = ?
            LIMIT 1
            `, {
                replacements: [slackTeamId, meetupId, forUser],
                type: QueryTypes.SELECT,
                model: db.MeetupRegistrationGroupUser
            }
        );
        return _.first(matches);
    
    }
}

module.exports = FindMeetupRegGroupUser;