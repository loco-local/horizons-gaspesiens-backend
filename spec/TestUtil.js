const config = require('../config');
config.setEnvironment('test');
const chai = require('chai');
require('chai').should();
chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.use(require('chai-string'));

const sinon = require('sinon');
const redis = require('async-redis');
const moment = require("moment");
const RedisMock = require('../RedisProvider');

const FAKE_CURRENT_DATE = "23/10/2022"


const TestUtil = {};

module.exports = TestUtil;
