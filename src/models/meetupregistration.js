"use strict";
const SlackUserAudit = require("./constants/SlackUserAudit");
module.exports = (sequelize, { DataTypes }) => {
  class MeetupRegistration extends SlackUserAudit {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Meetup, MeetupRegistrationFood, MeetupRegistrationGroupUser }) {
      this.belongsTo(Meetup, {
        foreignKey: "meetup_id",
        as: "meetup",
      });
      this.hasOne(MeetupRegistrationFood, {
        foreignKey: "meetup_registration_id",
        // uniqueKey: "uniq_meetupregid_team_creator",
        as: "foodRegistration",
        onDelete: "CASCADE",
        hooks: true
      });
      this.hasMany(MeetupRegistrationGroupUser, {
        foreignKey: "meetup_registration_id",
        // uniqueKey: "uniq_meetupregid_team_creator",
        as: "meetupGroupUsers",
        onDelete: "CASCADE",
        hooks: true
      });
      this.hasOne(MeetupRegistrationGroupUser, {
        foreignKey: "grouped_user_meetup_registration_id",
        as: "includedInGroupRegistration",
        onDelete: "SET NULL",
        hooks: true,
        allowNull: true
      });
    }
  }
  MeetupRegistration.init(
    {
      meetupId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Meetup",
          key: "id",
        },
        field: "meetup_id",
        onDelete: 'CASCADE'
      },
      adultRegistrationCount: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        field: "adult_registration_count",
      },
      childRegistrationCount: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        field: "child_registration_count",
      },
      slackTeamId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "slack_team_id",
      },
      createdBy: {
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
      notes: {
        allowNull: true,
        type: DataTypes.TEXT,
        field: "notes",
        defaultValue: null
      }
    },
    {
      sequelize,
      modelName: "MeetupRegistration",
      tableName: "meetup_registrations",
      indexes: [
        {
          name: "uniq_meetup_team_creator",
          type: "UNIQUE",
          unique: true,
          fields: ["meetup_id", "slack_team_id", "created_by"],
        },
      ],
    }
  );
  return MeetupRegistration;
};
