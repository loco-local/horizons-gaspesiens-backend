
const RedisProvider = require('../RedisProvider');
const redisClient = RedisProvider.build()

const config = require('../config')
const moment = require("moment");
require('moment/locale/fr');
moment.locale('fr');
const EmailClient = require("../EmailClient")
const MembershipRow = require('../MembershipRow');
const Now = require("../Now");
const DateUtil = require("../DateUtil");
const RowsOfMember = require("../RowsOfMember");
const SpreadsheetRowsOfMembership = require("../SpreadsheetRowsOfMembership");
const UpToDateWithSpreadsheetColumnsValidator = require("../UpToDateWithSpreadsheetColumnsValidator");
const MembershipController = {};
const daysBetweenEmails = 300;
const welcomeEmailSinceMaxDays = 60;
const nbDaysBufferToRegisterPayment = 50;
const nbDaysBeforeExpirationForReminder = 15;
const nbDaysWithinToSendThankYouRenewEmailAfterPayment = 5;
const inactiveRenewEmail = "inactive_renew_email";
const welcomeEmail = "welcome_email";
const neverPaidEmail = "never_paid_email";
const expiresSoonEmail = "expires_soon_email";
const thankYouRenewEmail = "thank_you_renew_email";
const templatesId = {};
const thankYouEmailTemplate = "d-90629f28f34846fcb5f64046fa6568ec"
templatesId[welcomeEmail] = thankYouEmailTemplate;
templatesId[neverPaidEmail] = "d-0f38412cd6b24aada90588b90747986d"
templatesId[inactiveRenewEmail] = "d-6cca9a5b35314bf9b1d25bafcdd17f37";
templatesId[expiresSoonEmail] = "d-e1e81b8e88c64e189dc096b6fd3833cb";
templatesId[thankYouRenewEmail] = thankYouEmailTemplate;


MembershipController.get = async function (req, res) {
    const { email } = req.body
    let emailToFind = email.trim().toLowerCase();
    const rows = await SpreadsheetRowsOfMembership.get();
    if (rows === false) {
        return res.sendStatus(500);
    }
    if (!rows.length) {
        console.log('No data found.');
        return res.sendStatus(500);
    }
    let status;
    const rowsOfMember = new RowsOfMember();
    rows.forEach((row) => {
        row = new MembershipRow(row);
        if (row.getEmail() === emailToFind) {
            rowsOfMember.addRow(row)
        }
    })
    const relevantRow = rowsOfMember.getStatusRelevantRowForEmail(emailToFind)
    if (relevantRow) {
        status = relevantRow.row.getStatus();
    } else {
        status = {
            status: "inactive",
            reason: "email not found"
        };
    }
    return res.send(status);
};

MembershipController.sendReminders = async function (req, res) {
    console.log("sending reminders " + Now.get().format());
    const remindersSent = [];
    const rowsOfSpreadsheet = await SpreadsheetRowsOfMembership.get();
    if (rowsOfSpreadsheet === false) {
        return res.sendStatus(500);
    }
    if (!rowsOfSpreadsheet.length) {
        console.log('No data found.');
        return res.sendStatus(500);
    }
    const areColumnsValid = UpToDateWithSpreadsheetColumnsValidator.isValid(rowsOfSpreadsheet);
    if (!areColumnsValid.isValid) {
        await MembershipController._sendCodeNotUpToDateWithSpreadsheetColumnsAlertEmail(areColumnsValid)
        return res.sendStatus(500);
    }
    let status;
    const rowsOfMember = new RowsOfMember()
    await Promise.all(rowsOfSpreadsheet.map(async (row) => {
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
                data.membershipDate = row.getRenewalDateFormatted();
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
                data.membershipDate = row.getRenewalDateFormatted();
                reminder = await MembershipController.buildReminder(
                    row,
                    thankYouRenewEmail,
                    data
                );
            }
        }
        rowsOfMember.addRow(row, reminder)
    }));
    rowsOfMember.getReminderRelevantRows().filter((row) => {
        return row.reminder !== false && row.reminder !== undefined && row.reminder !== null
    }).forEach((row) => {
        remindersSent.push(row.reminder);
    })
    const mondayWeekDay = 0
    if (Now.get().weekday() === mondayWeekDay) {
        let emailsInDuplicate = rowsOfMember.getEmailsHavingMultipleRows()
        if (emailsInDuplicate.length === 0) {
            emailsInDuplicate = "Aucuns duplicats trouvés"
        } else {
            emailsInDuplicate = emailsInDuplicate.join(",")
        }
        const emailsInDuplicateSendgridTemplate = "d-502c6df2ca5c4b35a9358d011cd4ccab";
        await EmailClient.sendTemplateEmail(
            "horizonsgaspesiens@gmail.com",
            emailsInDuplicateSendgridTemplate,
            {
                emailsInDuplicate: emailsInDuplicate
            }
        )
    }
    await MembershipController._sendEmails(remindersSent);
    console.log("finished sending nb reminders " + remindersSent.length + " " + Now.get().format());
    res.send(remindersSent);
};

MembershipController.listReminderStatus = async function (req, res) {
    if (config.get().remindersListPassword !== req.body.remindersListPassword) {
        return res.sendStatus(401);
    }
    let reminders = {};
    let error = false;
    const keys = await redisClient.keys("*");
    for (const key of keys) {
        let value = await redisClient.get(key);
        if(key.indexOf("@") > -1){
            reminders[key] = value;
        }    
    }
    if (error) {
        return res.send({
            error: error
        })
    }
    res.send({
        reminders
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
    sendOnlyOnce = sendOnlyOnce || false;
    if (row.doesNotWantToBeMember()) {
        // console.log(row.getEmail())
        return false;
    }
    const key = row.getEmail() + '_' + reminderKey;
    let emailDateStr = await redisClient.get(key);
    const emailSentInThePast = emailDateStr !== undefined && emailDateStr !== null;
    let shouldSend;
    if (sendOnlyOnce) {
        shouldSend = !emailSentInThePast;
    } else {
        if (emailSentInThePast) {
            if (!DateUtil.isStringATimestamp(emailDateStr)) {
                shouldSend = false;
                console.log("timestamp value is not a timestamp: " + emailDateStr);
            } else {
                let emailDate = moment(new Date(parseInt(emailDateStr)));
                const daysSinceLastEmail = Now.get().diff(emailDate, 'days');
                shouldSend = daysSinceLastEmail > daysBetweenEmails;
                const prefix = shouldSend ? "sending because it's been long enough between emails " : "prevented to send email";
                console.log(prefix + " " + key + " email date " + emailDate + " email date str " + emailDateStr + " " + " daysSinceLastEmail " + daysSinceLastEmail + " shouldSend " + shouldSend);

            }
        } else {
            shouldSend = true;
        }
    }
    if (shouldSend) {
        await redisClient.set(key, Now.get().toDate().getTime());
        return {
            email: row.getEmail(),
            type: reminderKey,
            data: data
        }
    } else {
        return false;
    }
};

MembershipController._sendEmails = function (emails) {
    return Promise.all(emails.map(async (email) => {
        await EmailClient.sendTemplateEmail(
            email.email,
            templatesId[email.type],
            email.data
        )
    }));
}

MembershipController._sendCodeNotUpToDateWithSpreadsheetColumnsAlertEmail = async function (isValid) {
    const spreadSheetIntegritySendgridTemplate = "d-d-c6e0f9f1ba4a41f8b213a2cb1263d617";
    await EmailClient.sendTemplateEmail(
        "horizonsgaspesiens@gmail.com",
        spreadSheetIntegritySendgridTemplate,
        {
            error: isValid.error
        }
    )
}

module.exports = MembershipController;
