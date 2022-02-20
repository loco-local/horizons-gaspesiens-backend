const config = require('../config');
config.setEnvironment('test');
const chai = require('chai');
require('chai').should();
chai.should();
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
chai.use(require('chai-string'));


const TestUtil = {};


module.exports = TestUtil;
