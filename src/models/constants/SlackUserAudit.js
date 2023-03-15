const { Model, DataTypes } = require('sequelize');

class SlackUserAudit extends Model {
    slackTeamId = {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'slack_team_id'
    };
    createdBy = {
        type: DataTypes.STRING,
        allowNull: false,
        field: 'created_by'
    };
    createdAt = {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: () => new Date(),
    };
}

module.exports = SlackUserAudit;
