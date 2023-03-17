'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('meetup_announcements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      meetupId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'meetups',
          key: 'id'
        },
        field: 'meetup_id',
        onDelete: 'CASCADE'
      },
      postingChannelId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'posting_channel_id'
      },
      postingMessageId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'posting_message_id'
      },
      slackTeamId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'slack_team_id'
      },
      createdBy: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'created_by'
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at',
        defaultValue: () => new Date()
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at',
        defaultValue: () => new Date()
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('meetup_announcements');
  }
};