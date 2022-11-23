const chai = require('chai');
const Now = require("../Now");
const TestUtil = require("./TestUtil");

let app = require('../app');
describe('MembershipControllerTest', () => {
    beforeEach(() => {
        TestUtil.data = {};
    });
    xit("sends never paid email", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        // console.log(res.body)
        const emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(5);
    });

    xit("avoid to sends never paid email if sent recently", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(5);
        TestUtil.data = {};
        TestUtil.data['vincent.blouin@gmail.com' + '_never_paid_email'] = Now.get().toDate().getTime();
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(4);
    });

    xit("sends never paid email again if sent more that a month ago", async () => {
        const nbDaysNotSoLongAgo = 10;
        TestUtil.data['vincent.blouin@gmail.com' + '_never_paid_email'] = Now.get().subtract(nbDaysNotSoLongAgo, 'days').toDate().getTime();
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(4);
        const nbDaysAWhileBack = 35;
        TestUtil.data = {};
        TestUtil.data['vincent.blouin@gmail.com' + '_never_paid_email'] = Now.get().subtract(nbDaysAWhileBack, 'days').toDate().getTime();
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(5);
    });

    xit("sends welcome email for subscription in last 60 days", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(5);
    });

    xit("only sends welcome email once", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(5);
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(0);
    });

    xit("sends email when expiration is soon", async () => {
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


    xit("sends thank you for renewal email", async () => {
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
