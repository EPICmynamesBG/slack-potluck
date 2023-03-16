'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('meetup_registrations', {
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
      adultRegistrationCount: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        field: 'adult_registration_count'
      },
      childRegistrationCount: {
        type: Sequelize.SMALLINT,
        allowNull: false,
        defaultValue: 0,
        field: 'child_registration_count'
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
    await queryInterface.dropTable('meetup_registrations');
  }
};