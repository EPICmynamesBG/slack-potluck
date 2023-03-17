"use strict";
const SlackUserAudit = require("./constants/SlackUserAudit");
module.exports = (sequelize, DataTypes) => {
  class MeetupAnnouncement extends SlackUserAudit {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ Meetup }) {
      this.belongsTo(Meetup, {
        foreignKey: "meetup_id",
        as: "meetup",
      });
    }
  }
  MeetupAnnouncement.init(
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
      postingChannelId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'posting_channel_id'
      },
      postingMessageId: {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'posting_message_id'
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
      modelName: "MeetupAnnouncement",
      tableName: "meetup_announcements",
    }
  );
  return MeetupAnnouncement;
};
