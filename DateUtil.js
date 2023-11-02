const NUMBER_REGEX = /^[0-9]*$/;

const DateUtil = {
    isStringATimestamp: function (timestampString) {
        return NUMBER_REGEX.test(timestampString)
    }
}

module.exports = DateUtil
