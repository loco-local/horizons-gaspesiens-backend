const {google} = require('googleapis');
const config = require('../config')
const redis = require('async-redis');
const redisClient = redis.createClient({
    host: config.getConfig().redis.host,
    port: config.getConfig().redis.port,
    password: config.getConfig().redis.password
});
const GOOGLE_CREDENTIALS_FILE_PATH = config.getConfig().googleCredentialsFilePath;
const GOOGLE_API_SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const moment = require("moment");
require('moment/locale/fr');
moment.locale('fr');
const EmailClient = require("../EmailClient")
const MembershipRow = require('../MembershipRow');
const Now = require("../Now");
const MembershipController = {};
const daysBetweenEmails = 34;
const welcomeEmailSinceMaxDays = 60;
const nbDaysBufferToRegisterPayment = 15;
const nbDaysBeforeExpirationForReminder = 15;
const nbDaysWithinToSendThankYouRenewEmailAfterPayment = 5;
const inactiveRenewEmail = "inactive_renew_email";
const welcomeEmail = "welcome_email";
const neverPaidEmail = "never_paid_email";
const expiresSoonEmail = "expires_soon_email";
const thankYouRenewEmail = "thank_you_renew_email";
const templatesId = {};
templatesId[welcomeEmail] = "d-003ba183c0024264b7f2ea13616cddf5"
templatesId[neverPaidEmail] = "d-0f38412cd6b24aada90588b90747986d"
templatesId[inactiveRenewEmail] = "d-6cca9a5b35314bf9b1d25bafcdd17f37";
templatesId[expiresSoonEmail] = "d-e1e81b8e88c64e189dc096b6fd3833cb";
templatesId[thankYouRenewEmail] = "d-90629f28f34846fcb5f64046fa6568ec";


MembershipController.get = async function (req, res) {
    const {email} = req.body
    let emailToFind = email;
    let rowsWithEmail = [];
    const sheets = MembershipController._buildSheetsApi();
    sheets.spreadsheets.values.get({
        spreadsheetId: config.getConfig().spreadSheetId,
        range: 'A2:T',
    }, (err, sheetsRes) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = sheetsRes.data.values;
        let status;
        if (rows.length) {
            rowsWithEmail = rows.filter((row) => {
                row = new MembershipRow(row);
                return row.getEmail() === emailToFind.trim().toLowerCase();
            }).map((row) => {
                return new MembershipRow(row);
            })
            if (rowsWithEmail.length) {
                status = rowsWithEmail[0].getStatus();
            } else {
                status = {
                    status: "inactive",
                    reason: "email not found"
                };
            }
            return res.send(status);
        } else {
            console.log('No data found.');
            res.sendStatus(400);
        }
    });
};

MembershipController.sendReminders = async function (req, res) {
    console.log("sending reminders ");
    const sheets = MembershipController._buildSheetsApi();
    const remindersSent = [];
    sheets.spreadsheets.values.get({
        spreadsheetId: config.getConfig().spreadSheetId,
        range: 'A2:T',
    }, async (err, sheetsRes) => {
        if (err) return console.log('The API returned an error: ' + err);
        const rows = sheetsRes.data.values;
        let status;
        if (rows.length) {
            await Promise.all(rows.map(async (row) => {
                row = new MembershipRow(row);
                status = row.getStatus();
                let reminder;
                const data = {
                    email: row.getEmail(),
                    firstname: row.getFirstname()
                }
                let formFillDate = row.getDateFormFilled();
                const daysSinceFormFill = Now.get().diff(formFillDate, 'days');
                if (status.status === 'inactive') {
                    // if (nbDaysBufferToRegisterPayment) {
                    //     return
                    // }
                    if (status.reason === 'no renewal date') {
                        if (daysSinceFormFill > nbDaysBufferToRegisterPayment) {
                            data.formDate = row.getDateFormFilledFormatted();
                            reminder = await MembershipController.buildReminder(
                                row,
                                neverPaidEmail,
                                data
                            );
                        }
                    } else {
                        let expiredDate = row.getExpirationDate();
                        const daysSinceExpired = Now.get().diff(expiredDate, 'days');
                        if (daysSinceExpired > nbDaysBufferToRegisterPayment) {
                            data.expiredDate = row.getExpirationDateFormatted();
                            reminder = await MembershipController.buildReminder(
                                row,
                                inactiveRenewEmail,
                                data
                            );
                        }
                    }
                } else {
                    const daysSinceMembership = Now.get().diff(row.getRenewalDate(), 'days');
                    if (daysSinceFormFill <= welcomeEmailSinceMaxDays && daysSinceMembership <= welcomeEmailSinceMaxDays) {
                        data.memberSince = row.getRenewalDateFormatted();
                        reminder = await MembershipController.buildReminder(
                            row,
                            welcomeEmail,
                            data,
                            true
                        );
                    }
                    const daysBeforeExpiration = Now.get().diff(row.getExpirationDate(), 'days');
                    if (daysBeforeExpiration < 0 && Math.abs(daysBeforeExpiration) < nbDaysBeforeExpirationForReminder) {
                        data.expirationInDays = Math.abs(daysBeforeExpiration);
                        reminder = await MembershipController.buildReminder(
                            row,
                            expiresSoonEmail,
                            data
                        );
                    }
                    const daysSincePayment = Now.get().diff(row.getPaymentDate(), 'days');
                    if (daysSinceFormFill > 300 && daysSincePayment >= 0 && daysSincePayment < nbDaysWithinToSendThankYouRenewEmailAfterPayment) {
                        data.renewDate = row.getRenewalDateFormatted();
                        reminder = await MembershipController.buildReminder(
                            row,
                            thankYouRenewEmail,
                            data
                        );
                    }
                }
                if (reminder !== false && reminder !== undefined) {
                    remindersSent.push(reminder);
                }
            }));
            MembershipController._sendEmails(remindersSent);
            console.log("finished sending reminders ");
            res.send(remindersSent);
        } else {
            console.log('No data found.');
            res.sendStatus(400);
        }
    });
};

// MembershipController.testSendgrid = async function (req, res) {
//     const response = await EmailClient.sendTemplateEmail(
//         "vincent.blouin@gmail.com",
//         templatesId['inactive_renew_email'],
//         {
//             name: "Vincent",
//             email: "vincent.blouin@gmail.com"
//         }
//     )
//     res.sendStatus(response[0].statusCode);
// };

// MembershipController.testSetRedis = async function (req, res) {
//     await redisClient.set("test_poire", "test_savon")
//     res.sendStatus(200);
// };
//
// MembershipController.testGetRedis = async function (req, res) {
//     const test = await redisClient.get("test_poire");
//     res.send({
//         test: test
//     });
// };

MembershipController.buildReminder = async function (row, reminderKey, data, sendOnlyOnce) {
    sendOnlyOnce = sendOnlyOnce | false;
    if (row.doesNotWantToBeMember()) {
        // console.log(row.getEmail())
        return false;
    }
    const key = row.getEmail() + '_' + reminderKey;
    let emailDateStr = await redisClient.get(key);
    const emailSentInThePast = emailDateStr !== undefined;
    let shouldSend;
    if (sendOnlyOnce) {
        shouldSend = !emailSentInThePast;
    } else {
        if (emailSentInThePast) {
            let emailDate = moment(emailDateStr);
            const daysSinceLastEmail = Now.get().diff(emailDate, 'days');
            shouldSend = daysSinceLastEmail > daysBetweenEmails;
        } else {
            shouldSend = true;
        }
    }
    if (shouldSend) {
        await redisClient.set(key, Now.get().toDate().getTime())
        return {
            email: row.getEmail(),
            type: reminderKey,
            data: data
        }
    } else {
        return false;
    }
};

MembershipController._buildSheetsApi = function () {
    const auth = new google.auth.GoogleAuth({
        keyFile: GOOGLE_CREDENTIALS_FILE_PATH,
        scopes: GOOGLE_API_SCOPES,
    });
    return google.sheets({version: 'v4', auth});
};

MembershipController._sendEmails = function (emails) {
    emails.forEach((email) => {
        EmailClient.sendTemplateEmail(
            email.email,
            templatesId[email.type],
            email.data
        )
    });
}

module.exports = MembershipController;
