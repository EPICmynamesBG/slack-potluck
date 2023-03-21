'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('oauth_installations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slackBotObject: {
        type: Sequelize.TEXT,
        field: 'slack_bot_object',
        comment: 'Encrypted JSON object which includes bot token + refresh token',
        allowNull: false
      },
      scopesGranted: {
        type: Sequelize.TEXT,
        field: 'scopes_granted'
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
      },
      slackEnterpriseId: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'slack_enterprise_id',
        defaultValue: null
      },
      slackUserObject: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'slack_user_object',
        comment: 'Encrypted JSON object which includes user token + refresh token',
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('oauth_installations');
  }
};