'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('meetups', 'include_food_signup', {
      field: 'include_food_signup',
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: () => false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('meetups', 'include_food_signup');
  }
};
