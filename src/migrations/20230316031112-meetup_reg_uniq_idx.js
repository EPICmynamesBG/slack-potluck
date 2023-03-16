'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addIndex(
      "meetup_registrations",
      ["meetup_id", "slack_team_id", "created_by"],
      {
        name: "uniq_meetup_team_creator",
        type: "UNIQUE",
        unique: true,
      }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('meetup_registrations', 'uniq_meetup_team_creator');
  }
};
