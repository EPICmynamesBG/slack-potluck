'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('meetup_registration_group_users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meetupRegistrationId: {
        type: Sequelize.INTEGER,
        references: {
          model: "meetup_registrations",
          key: "id",
        },
        field: "meetup_registration_id",
        onDelete: 'CASCADE'
      },
      slackTeamId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "slack_team_id",
      },
      createdBy: {
        // The creator of the registration
        type: Sequelize.STRING,
        allowNull: false,
        field: "created_by",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "created_at",
        defaultValue: () => new Date(),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: "updated_at",
        defaultValue: () => new Date(),
      },
      groupedSlackUserId: {
        // description: "The Slack user being included in the registration"
        allowNull: false,
        type: Sequelize.STRING,
        field: "grouped_slack_user_id"
      },
      groupedUserRegistrationId: {
        type: Sequelize.INTEGER,
        references: {
          model: "meetup_registrations",
          key: "id",
        },
        field: "grouped_user_meetup_registration_id",
        onDelete: 'SET NULL',
        allowNull: true
      }
    });
    await queryInterface.addIndex(
      "meetup_registration_group_users",
      ["meetup_registration_id", "grouped_slack_user_id"],
      {
        name: "uniq_meetup_group_user",
        type: "UNIQUE",
        unique: true,
      }
    );

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('meetup_registration_group_users', 'uniq_meetup_group_user');
    await queryInterface.dropTable('meetup_registration_group_users');
  }
};