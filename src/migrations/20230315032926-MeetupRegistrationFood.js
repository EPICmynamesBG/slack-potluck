"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const FoodSlot = {
      MAIN_DISH: "Main Dish",
      SIDE_DISH: "Side Dish",
      DESSERT: "Dessert",
      BEVERAGES: "Beverages",
      UNDECIDED: "Undecided",
    };
    await queryInterface.createTable("meetup_registration_food", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      meetupRegistrationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "meetup_registrations",
          field: "id"
        },
        field: "meetup_registration_id",
        onDelete: 'CASCADE'
      },
      foodSlot: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "food_slot",
        validate: {
          isIn: Object.values(FoodSlot),
        },
        defaultValue: () => FoodSlot.UNDECIDED,
      },
      description: {
        // food description
        type: Sequelize.STRING,
        allowNull: true,
      },
      slackTeamId: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "slack_team_id",
      },
      createdBy: {
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
    });

    await queryInterface.addIndex(
      "meetup_registration_food",
      ["meetup_registration_id", "slack_team_id", "created_by"],
      {
        name: "uniq_meetupregid_team_creator",
        type: "UNIQUE",
        unique: true,
      }
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("meetup_registration_food");
  },
};
