const dotenv = require("dotenv");
// load .env
dotenv.config();
dotenv.config('.env.test');

global.sinon = require('sinon');
global.assert = require('node:assert');

Object.assign(global, require('./hooks'));
