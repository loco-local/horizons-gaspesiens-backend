const config = require('../config');
config.setEnvironment('test');
const chai = require('chai');
require('chai').should();
chai.should();
const chaiHttp = require('chai-http');
const Now = require("../Now");
chai.use(chaiHttp);
chai.use(require('chai-string'));

const sinon = require('sinon');
const redis = require('async-redis');
const moment = require("moment");

let data = {};
let redisClient = {
    'get': (key) => {
        return data[key]
    },
    'set': (key, value) => {
        data[key] = value;
    },
    'exits': (key) => {
        return data.hasOwnProperty(key)
    }
}
sinon.stub(redis,
    "createClient").callsFake(() => redisClient);
sinon.stub(Now, "get").callsFake(() => {
    return moment(
        "23/10/2022",
        'DD/MM/YYYY'
    )
})

const TestUtil = {
    data: data
};


module.exports = TestUtil;
