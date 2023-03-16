'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('meetups', 'additional_notes', {
      field: 'additional_notes',
      type: Sequelize.TEXT,
      allowNull: true,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('meetups', 'additional_notes');
  }
};
