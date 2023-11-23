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

const FAKE_CURRENT_DATE = "23/10/2022"

const TestUtil = {
    data: {}
};
let redisClient = {
    'get': (key) => {
        return TestUtil.data[key]
    },
    'set': (key, value) => {
        TestUtil.data[key] = value;
    },
    'exits': (key) => {
        return TestUtil.data.hasOwnProperty(key)
    }
}
sinon.stub(redis,
    "createClient").callsFake(() => redisClient);
sinon.stub(Now, "get").callsFake(() => {
    let nowFaked = moment(
        FAKE_CURRENT_DATE,
        'DD/MM/YYYY'
    )
    sinon.stub(nowFaked, "weekday").callsFake(() => {
        return 0
    })
    return nowFaked;
})


module.exports = TestUtil;
