"use strict";
const SlackUserAudit = require("./constants/SlackUserAudit");
const FoodSlot = require('./constants/FoodSlot');

module.exports = (sequelize, DataTypes) => {
  class MeetupRegistration extends SlackUserAudit {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate({ MeetupRegistration }) {
      this.belongsTo(MeetupRegistration, {
        foreignKey: "meetup_registration_id",
        as: "MeetupRegistration",
      });
    }
  }
  MeetupRegistration.init(
    {
      meetupRegistrationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "MeetupRegistration",
          field: "id",
        },
        field: "meetup_registration_id",
      },
      foodSlot: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "food_slot",
        validate: {
          isIn: Object.values(FoodSlot),
        },
        defaultValue: () => FoodSlot.UNDECIDED,
      },
      description: {
        // food description
        type: DataTypes.STRING,
        allowNull: true,
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
      tableName: "meetup_registration_food",
      indexes: [
        {
          name: "uniq_meetupregid_team_creator",
          type: "UNIQUE",
          unique: true,
          fields: ["meetup_registration_id", "slack_team_id", "created_by"],
        },
      ],
    }
  );
  return MeetupRegistration;
};
