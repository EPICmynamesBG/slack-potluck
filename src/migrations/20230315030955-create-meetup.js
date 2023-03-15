'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('meetups', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      timestamp: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      locationAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
        field: 'location_address'
      },
      locationAlias: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'location_alias'
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
    await queryInterface.dropTable('meetups');
  }
};