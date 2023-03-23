const crypto = require('crypto');

const secret = process.env.ENCRYPTION_SECRET;
if (!secret) {
    throw new Error('Missing ENCRYPTION_SECRET');
}

class Encryption {
    static algorithm = 'aes-256-cbc';
    static IV_LENGTH = 16;
    static ENCRYPTION_KEY = crypto.scryptSync(secret, 'salt', 32);

    static encrypt(text) {
        let iv = crypto.randomBytes(Encryption.IV_LENGTH);
        let cipher = crypto.createCipheriv(Encryption.algorithm, Buffer.from(Encryption.ENCRYPTION_KEY, 'hex'), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    }

    static decrypt(text) {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(Encryption.algorithm, Buffer.from(Encryption.ENCRYPTION_KEY, 'hex'), iv);
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
        return Encryption.encrypt(JSON.stringify(obj));
    }

    /**
     * 
     * @param {string} str
     * @returns {object}
     */
    static decryptObject(str) {
        return JSON.parse(Encryption.decrypt(str));
    }
}

module.exports = Encryption;
