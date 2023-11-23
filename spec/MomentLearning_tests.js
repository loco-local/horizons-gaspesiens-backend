const moment = require("moment");

describe('MomentLearning', () => {
    xit("test monday", () => {
        const date = moment();
        let day = date.weekday();
        day.should.equal(3)
        date.subtract(1, 'days')
        day = date.weekday();
        day.should.equal(2)
    })
})
