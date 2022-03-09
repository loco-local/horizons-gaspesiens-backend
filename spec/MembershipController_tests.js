// const TestUtil = require("./TestUtil");
const chai = require('chai');
const sinon = require('sinon');
const redis = require('async-redis');
const moment = require("moment");
const Now = require("../Now");
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
    //Now is 8 march 2022
    return moment(
        "08/03/2022",
        'DD/MM/YYYY'
    )
})
let app = require('../app');
describe('MembershipControllerTest', () => {
    beforeEach(() => {
        data = {};
    });
    it("sends never paid email", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        const emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(5);
    });

    it("avoid to sends never paid email if sent recently", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(5);
        data = {};
        data['vincent.blouin@gmail.com' + '_never_paid_email'] = Now.get().toDate().getTime();
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(4);
    });

    it("sends never paid email again if sent more that a month ago", async () => {
        const nbDaysNotSoLongAgo = 10;
        data['vincent.blouin@gmail.com' + '_never_paid_email'] = Now.get().subtract(nbDaysNotSoLongAgo, 'days').toDate().getTime();
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(4);
        const nbDaysAWhileBack = 35;
        data = {};
        data['vincent.blouin@gmail.com' + '_never_paid_email'] = Now.get().subtract(nbDaysAWhileBack, 'days').toDate().getTime();
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(5);
    });

    it("sends welcome email for subscription in last 60 days", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(5);
    });

    it("only sends welcome email once", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(5);
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(0);
    });

    it("sends email when expiration is soon", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'expires_soon_email');
        emails.length.should.equal(1);
        emails[0].data.expirationInDays.should.equal(8);
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'expires_soon_email');
        emails.length.should.equal(0);
    });


    it("sends thank you for renewal email", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'thank_you_renew_email');
        emails.length.should.equal(1);
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'thank_you_renew_email');
        emails.length.should.equal(0);
    });

    function getEmailsOfType(emails, type) {
        return emails.filter((email) => {
            return email.type === type;
        })
    }
});
