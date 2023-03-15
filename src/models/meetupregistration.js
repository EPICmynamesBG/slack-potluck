"use strict";
const SlackUserAudit = require("./constants/SlackUserAudit");
module.exports = (sequelize, DataTypes) => {
  class MeetupRegistration extends SlackUserAudit {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Meetup, MeetupRegistrationFood }) {
      this.belongsTo(Meetup, {
        foreignKey: "meetup_id",
        as: "meetup",
      });
      this.hasOne(MeetupRegistrationFood, {
        foreignKey: "uniq_meetupregid_team_creator",
        as: "foodRegistration",
        onDelete: "CASCADE",
        hooks: true,
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
    },
    {
      sequelize,
      modelName: "MeetupRegistration",
      tableName: "meetup_registrations",
    }
  );
  return MeetupRegistration;
};