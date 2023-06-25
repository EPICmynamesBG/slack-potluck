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

    // Compex left join to meetup_registrations that offsets the original registration count
    //  if/when an "included user" has separately registered
    static __QueryLogic = `
    LEFT JOIN (
        SELECT meetup_registrations.id,
          meetup_registrations.meetup_id,
          SUM(meetup_registrations.adult_registration_count) - COALESCE(offset_adult_registration_count, 0) as adult_registration_count,
          SUM(meetup_registrations.child_registration_count) - COALESCE(offset_child_registration_count, 0) as child_registration_count
        FROM meetup_registrations
        LEFT JOIN (
          SELECT og.id,
            GREATEST(SUM(grouped.adult_registration_count), 1) AS offset_adult_registration_count,
            SUM(grouped.child_registration_count) AS offset_child_registration_count 
           FROM meetup_registration_group_users g
           JOIN meetup_registrations og ON (og.id = g.meetup_registration_id)
           JOIN meetup_registrations grouped ON (grouped.id = g.grouped_user_meetup_registration_id)
           WHERE og.meetup_id = ?
           GROUP BY og.id
        ) meetup_registration_offset ON (meetup_registrations.id = meetup_registration_offset.id)
        WHERE meetup_registrations.meetup_id = ?
        GROUP BY meetup_registrations.id, meetup_registrations.meetup_id
      ) mod_meetup_registrations ON (meetups.id = mod_meetup_registrations.meetup_id)
          `;

    static _QueryLogic = function _QueryLogic(...meetupIds) {
        if (meetupIds.length == 0) {
            throw new Error('At least one meetupId required');
        }
        if (meetupIds.length == 1) {
            return __QueryLogic;
        }
        return __QueryLogic.replace(/meetup_id = \?/g, 'meetup_id IN ?');
    }

    static getMeetup(meetupId) {
        return db.sequelize.query(
            `
            ${this._SelectFields}
            FROM meetups
            ${this._QueryLogic(meetupId)}
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

    static async getUpcomingForTeam(slackTeamId) {
        var upcomingMeetups = await db.sequelize.query(
            `
            SELECT meetups.id
            FROM meetups
            WHERE meetups.slack_team_id = ?
              AND meetups.timestamp > now()
            GROUP BY meetups.id
            ORDER BY meetups.timestamp ASC
            LIMIT 5
            `, {
                replacements: [slackTeamId],
                type: QueryTypes.SELECT,
                model: db.Meetup
            }
        );
        var meetupIds = upcomingMeetups.map(x => x.Id);
        return await db.sequelize.query(
            `
            ${this._SelectFields}
            FROM meetups
            ${this._QueryLogic(...meetupIds)}
            WHERE meetups.slack_team_id = ?
              AND meetups.id IN ?
            GROUP BY meetups.id
            ORDER BY meetups.timestamp ASC
            LIMIT 5
            `, {
                replacements: [meetupIds, meetupIds, slackTeamId, meetupIds],
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
