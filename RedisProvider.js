const config = require('./config')
const redis = require('async-redis');
const RedisProvider = {
    data: {},
    build: function () {
        if (config.get().redis === "mock") {
            return RedisProvider._setupMock();
        } else {
            return RedisProvider._setupNonMock();
        }

    },
    _setupNonMock: function () {
        return redis.createClient({
            host: config.get().redis.host,
            port: config.get().redis.port,
            password: config.get().redis.password
        });
    },
    _setupMock: function () {
        const sinon = require('sinon');
        const Now = require("./Now");
        const moment = require("moment");
        const FAKE_CURRENT_DATE = "23/10/2022"
        let redisClient = {
            'get': (key) => {
                return RedisProvider.data[key]
            },
            'set': (key, value) => {
                RedisProvider.data[key] = value;
            },
            'exits': (key) => {
                return RedisProvider.data.hasOwnProperty(key)
            },
            'keys': () => {
                return Object.keys(RedisProvider.data);
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
        return redisClient
    }
}

module.exports = RedisProvider;