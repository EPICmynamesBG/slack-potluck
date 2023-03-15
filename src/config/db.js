const { Sequelize } = require('sequelize');

let singleton;
class Db {
    constructor() {
        const connString = process.env.DATABASE_CONNECTION_STRING;
        if (connString) {
            console.debug('Setting up DB connection...');
            this.sequelize = new Sequelize(connString);
        } else {
            console.debug('Using in-memory db');
            this.sequelize = new Sequelize('sqlite::memory:');
        }
    }

    static async init() {
        singleton = new Db();
        
    }

    static get() {
        if (!singleton) {
            this.init();
        }
        return singleton.sequelize;
    }
}

module.exports = Db;
