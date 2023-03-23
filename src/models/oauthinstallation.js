'use strict';
const {
  Model
} = require('sequelize');
const { encryptObject } = require('../helpers/encryption');

module.exports = (sequelize, DataTypes) => {
  class OAuthInstallation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    static _encryptFields(record) {
      if (typeof(record.slackBotObject) !== 'string' && record.slackBotObject) {
        record.slackBotObject = encryptObject(record.slackBotObject);
      }
      if (typeof(record.slackUserObject) !== 'string' && record.slackUserObject) {
        record.slackUserObject = encryptObject(record.slackUserObject);
      }
    }

    static _stringifyScopes(record) {
      if (typeof(record.scopesGranted) !== 'string' && record.scopesGranted) {
        record.scopesGranted = JSON.stringify(record.scopesGranted);
      }
    }

    static beforeValidate(record) {
      this._encryptFields(record);
      this._stringifyScopes(record);
    }

    static beforeCreate(record) {
      this._encryptFields(record);
      this._stringifyScopes(record);
    }

    static beforeUpdate(record) {
      this._encryptFields(record);
      this._stringifyScopes(record);
    }
  }
  OAuthInstallation.init({
    slackBotObject: {
      type: DataTypes.TEXT,
      field: 'slack_bot_object',
      comment: 'Encrypted JSON object which includes bot token + refresh token',
      allowNull: false
    },
    scopesGranted: {
      type: DataTypes.TEXT,
      field: 'scopes_granted'
    },
    slackTeamId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "slack_team_id",
    },
    createdBy: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "created_by",
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      field: "created_at",
      defaultValue: () => new Date(),
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      field: "updated_at",
      defaultValue: () => new Date(),
    },
    slackEnterpriseId: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'slack_enterprise_id',
      defaultValue: null
    },
    slackUserObject: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'slack_user_object',
      comment: 'Encrypted JSON object which includes user token + refresh token',
    }
  }, {
    sequelize,
    modelName: 'OAuthInstallation',
    tableName: 'oauth_installations',
    hooks: {
      beforeCreate: OAuthInstallation.beforeCreate,
      beforeUpdate: OAuthInstallation.beforeUpdate,
      beforeValidate: OAuthInstallation.beforeValidate
    },
  });
  return OAuthInstallation;
};