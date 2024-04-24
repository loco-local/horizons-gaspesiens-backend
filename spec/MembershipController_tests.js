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
        // console.log(emails)
        //the number who never paid is 8 but the date form is filled is lower than nbDaysBufferToRegisterPayment
        emails.length.should.equal(6);
    });

    xit("avoid to sends never paid email if sent recently", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(6);
        TestUtil.data = {};
        TestUtil.data['patatepoire@gmail.test' + '_never_paid_email'] = Now.get().subtract(2, 'days').toDate().getTime();
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(5);
    });

    xit("sends never paid email again if sent after more than 300 days", async () => {
        const nbDaysNotSoLongAgo = 10;
        TestUtil.data['vincent.blouin@gmail.test' + '_never_paid_email'] = Now.get().subtract(nbDaysNotSoLongAgo, 'days').toDate().getTime();
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(6)
        const nbDaysAWhileBack = 301;
        TestUtil.data = {};
        TestUtil.data['patatepoire@gmail.test' + '_never_paid_email'] = Now.get().subtract(nbDaysAWhileBack, 'days').toDate().getTime();
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'never_paid_email');
        emails.length.should.equal(6);
    });

    xit("sends welcome email for subscription in last 60 days", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(18);
    });

    xit("only sends welcome email once", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(18);
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'welcome_email');
        emails.length.should.equal(0);
    });

    xit("sends email when expiration is soon", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'expires_soon_email');
        //should exclude orangenanane@gmail.test
        emails.length.should.equal(6);
        emails[0].data.expirationInDays.should.equal(13);
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'expires_soon_email');
        emails.length.should.equal(0);
    });


    xit("sends thank you for renewal email", async () => {
        let res = await chai.request(app)
            .get('/api/membership/send_reminder')
        let emails = getEmailsOfType(res.body, 'thank_you_renew_email');
        emails.length.should.equal(3);
        res = await chai.request(app)
            .get('/api/membership/send_reminder')
        emails = getEmailsOfType(res.body, 'thank_you_renew_email');
        emails.length.should.equal(0);
    });

    xit("return status is member if one the rows says so", async () => {
        let res = await chai.request(app)
            .post('/api/membership').send({email: "orangenanane@gmail.test"})
        res.body.status.should.equal("active")
    });

    function getEmailsOfType(emails, type) {
        return emails.filter((email) => {
            return email.type === type;
        })
    }
});
