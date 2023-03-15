'use strict';
const SlackUserAudit = require('./constants/SlackUserAudit');
module.exports = (sequelize, DataTypes) => {
  class Meetup extends SlackUserAudit {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ MeetupRegistration }) {
      this.hasMany(MeetupRegistration, {
        foreignKey: "meetupId",
        as: "registrations",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Meetup.init({
    timestamp: {
        type: DataTypes.DATE,
        allowNull: false
    },
    locationAddress: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'location_address'
    },
    locationAlias: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'location_alias'
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
  }, {
    sequelize,
    modelName: 'Meetup',
    tableName: 'meetups'
  });

  return Meetup;
};