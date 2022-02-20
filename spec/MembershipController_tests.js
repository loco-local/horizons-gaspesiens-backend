// const TestUtil = require("./TestUtil");
const chai = require('chai');
const sinon = require('sinon');
const redis = require('redis');
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
let redisClientStub = sinon.stub(redis,
    "createClient").callsFake(() => redisClient);
let app = require('../app');
describe('MembershipControllerTest', () => {
    beforeEach(() => {
        data = {};
    });
    it("sends never paid email", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        const emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(3);
    });

    it("avoid to sends never paid email if sent recently", async () => {
        data['vincent.blouin@gmail.com' + '_never_paid_email'] = new Date().getTime();
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        const emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(2);
    });

    it("sends never paid email again if sent more that a month ago", async () => {
        data['vincent.blouin@gmail.com' + '_never_paid_email'] = moment().subtract('33', 'days').toDate().getTime();
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        console.log(res.body);
        const emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(3);
    });

    function getEmailsOfType(emails, type) {
        return emails.filter((email) => {
            return email.type === type;
        })
    }
});
