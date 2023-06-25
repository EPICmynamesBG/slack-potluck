"use strict";
const SlackUserAudit = require("./constants/SlackUserAudit");
module.exports = (sequelize, DataTypes) => {
  class MeetupRegistrationGroupUser extends SlackUserAudit {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ MeetupRegistration }) {
      this.belongsTo(MeetupRegistration, {
        foreignKey: "meetup_registration_id",
        as: "meetup_registration",
        onDelete: "CASCADE",
        hooks: true
      });
      this.belongsTo(MeetupRegistration, {
        foreignKey: "grouped_user_meetup_registration_id",
        as: "grouped_meetup_registration",
        onDelete: "SET NULL",
        hooks: true,
        allowNull: true
      });
    }
  }
  MeetupRegistrationGroupUser.init(
    {
      meetupRegistrationId: {
        type: DataTypes.INTEGER,
        references: {
          model: "MeetupRegistration",
          key: "id",
        },
        field: "meetup_registration_id",
        onDelete: 'CASCADE'
      },
      slackTeamId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "slack_team_id",
      },
      createdBy: {
        // The creator of the registration
        type: DataTypes.STRING,
        allowNull: false,
        field: "created_by",
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "created_at",
        defaultValue: () => new Date(),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "updated_at",
        defaultValue: () => new Date(),
      },
      groupedSlackUserId: {
        // description: "The Slack user being included in the registration"
        allowNull: false,
        type: DataTypes.STRING,
        field: "grouped_slack_user_id"
      },
      groupedUserRegistrationId: {
        type: DataTypes.INTEGER,
        references: {
          model: "MeetupRegistration",
          key: "id",
        },
        field: "grouped_user_meetup_registration_id",
        onDelete: 'SET NULL',
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "MeetupRegistrationGroupUser",
      tableName: "meetup_registration_group_users",
      indexes: [
        {
          name: "uniq_meetup_group_user",
          type: "UNIQUE",
          unique: true,
          fields: ["meetup_registration_id", "grouped_slack_user_id"],
        },
      ],
    }
  );
  return MeetupRegistration;
};
