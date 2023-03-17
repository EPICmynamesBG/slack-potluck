const { QueryTypes, DataTypes } = require('sequelize');
const db = require('../index');


class MeetupWithRegistrationCount extends db.Meetup {
    static _SelectFields = `
    SELECT meetups.id,
        meetups.timestamp,
        meetups.location_address AS locationAddress,
        meetups.location_alias AS locationAlias,
        meetups.slack_team_id AS slackTeamId,
        meetups.created_by AS createdBy,
        meetups.created_at AS createdAt,
        meetups.updated_at AS updatedAt,
        meetups.additional_notes AS additionalNotes,
        meetups.include_food_signup AS includeFoodSignup,
        SUM(meetup_registrations.adult_registration_count) AS adultsRegistered,
        SUM(meetup_registrations.child_registration_count) AS childrenRegistered
    `;

    static getMeetup(meetupId) {
        return db.sequelize.query(
            `
            ${this._SelectFields}
            FROM meetups
            LEFT JOIN meetup_registrations ON (meetups.id = meetup_registrations.meetup_id)
            WHERE meetups.id = ?
            GROUP BY meetups.id
            ORDER BY meetups.timestamp ASC
            LIMIT 1
            `, {
                replacements: [meetupId],
                type: QueryTypes.SELECT,
                plain: true,
                model: MeetupWithRegistrationCount
            }
        );
    }

    static getUpcomingForTeam(slackTeamId) {
        return db.sequelize.query(
            `
            ${this._SelectFields}
            FROM meetups
            LEFT JOIN meetup_registrations ON (meetups.id = meetup_registrations.meetup_id)
            WHERE meetups.slack_team_id = ?
              AND meetups.timestamp > now()
            GROUP BY meetups.id
            ORDER BY meetups.timestamp ASC
            LIMIT 10
            `, {
                replacements: [slackTeamId],
                type: QueryTypes.SELECT,
                model: MeetupWithRegistrationCount
            }
        );
    }
}

MeetupWithRegistrationCount.init({
    adultsRegistered: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0
    },
    childrenRegistered: {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: 0
    }
}, {
    sequelize: db.sequelize,
    modelName: 'MeetupWithRegistrationCount'
});

module.exports = MeetupWithRegistrationCount;
