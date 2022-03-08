// const TestUtil = require("./TestUtil");
const chai = require('chai');
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
        const nbDaysNotSoLongAgo = 10;
        data['vincent.blouin@gmail.com' + '_never_paid_email'] = moment().subtract(nbDaysNotSoLongAgo, 'days').toDate().getTime();
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(2);
        const nbDaysAWhileBack = 35;
        data = {};
        data['vincent.blouin@gmail.com' + '_never_paid_email'] = moment().subtract(nbDaysAWhileBack, 'days').toDate().getTime();
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(3);
    });

    it("sends welcome email for subscription in last 60 days", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(3);
    });

    it("only sends welcome email once", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(3);
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(0);
    });


    function getEmailsOfType(emails, type) {
        return emails.filter((email) => {
            return email.type === type;
        })
    }
});
