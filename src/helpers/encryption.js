const crypto = require('crypto');

const key = process.env.ENCRYPTION_SECRET;
if (!key) {
    throw new Error('Missing ENCRYPTION_SECRET');
}

class Encryption {
    static algorithm = 'aes-256-cbc';
    static IV_LENGTH = 16;

    static encrypt(text) {
        let iv = crypto.randomBytes(this.IV_LENGTH);
        let cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    static decrypt(text) {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();    
    }

    /**
     * 
     * @param {object} obj
     * @returns {string}
     */
    static encryptObject(obj) {
        return this.encrypt(JSON.stringify(obj));
    }

    /**
     * 
     * @param {string} str
     * @returns {object}
     */
    static decryptObject(str) {
        return JSON.parse(this.decrypt(str));
    }
}

module.exports = Encryption;
