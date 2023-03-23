const { decryptObject } = require('../helpers/encryption');

class OAuthInstallationDTO {
    constructor(oauthInstallationModel) {
        this.oauthInstallation = oauthInstallationModel;
    }

    getDecryptedBot() {
        return decryptObject(this.oauthInstallation.slackBotObject);
      }
  
      getBotToken() {
        return this.getDecryptedBot().token;
      }
  
      getDecryptedUser() {
        if (this.oauthInstallation.slackUserObject) {
          return decryptObject(this.oauthInstallation.slackUserObject);
        }
        return undefined;
      }
  
      getUserToken() {
        try {
          return this.getDecryptedUser().token;
        } catch (e) {
          return undefined;
        }
      }
  
      /**
       * 
     * @returns {import("@slack/bolt").Installation}
       */
      asInstallation() {
        const output = {
          team: {
            id: this.oauthInstallation.slackTeamId
          },
          enterprise: this.oauthInstallation.enterprise ? {
            id: this.oauthInstallation.enterprise
          } : undefined,
          user: this.getDecryptedUser(),
          bot: this.getDecryptedBot(),
          appId: process.env.SLACK_APP_ID,
          tokenType: 'bot'
        };
        return output;
      } 
}

module.exports = OAuthInstallationDTO;
