'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('meetup_registrations', 'notes', {
      field: 'additional_notes',
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });

  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('meetup_registrations', 'notes');
  }
};