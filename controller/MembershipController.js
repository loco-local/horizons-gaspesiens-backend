const {google} = require('googleapis');
const config = require('../config')
const redis = require('redis');
const redisClient = redis.createClient({
    host: config.getConfig().redis.host,
    port: config.getConfig().redis.port,
    password: config.getConfig().redis.password,
    legacyMode: true
});
const GOOGLE_CREDENTIALS_FILE_PATH = config.getConfig().googleCredentialsFilePath;
const GOOGLE_API_SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const moment = require("moment");
const EmailClient = require("../EmailClient")
const MembershipRow = require('../MembershipRow');
const MembershipController = {};
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
                if (status.status === 'inactive') {
                    let reminder;
                    if (status.reason === 'no renewal date') {
                        reminder = await MembershipController.sendReminder(
                            row,
                            "never_paid_email"
                        );
                    } else {
                        reminder = await MembershipController.sendReminder(
                            row,
                            "inactive_renew_email"
                        );
                    }
                    if (reminder !== false) {
                        remindersSent.push(reminder);
                    }
                } else {

                }
            }));
            res.send(remindersSent);
        } else {
            console.log('No data found.');
            res.sendStatus(400);
        }
    });
};

MembershipController.testSendgrid = async function (req, res) {
    const response = await EmailClient.sendTemplateEmail(
        "vincent.blouin@gmail.com",
        "d-003ba183c0024264b7f2ea13616cddf5",
        {
            name: "Vincent",
            email: "vincent.blouin@gmail.com"
        }
    )
    res.sendStatus(response[0].statusCode);
};

MembershipController.testSetRedis = async function (req, res) {
    await redisClient.set("test_poire", "test_savon")
    res.sendStatus(200);
};

MembershipController.testGetRedis = async function (req, res) {
    const test = await redisClient.get("test_poire");
    res.send({
        test: test
    });
};

MembershipController.sendReminder = async function (row, reminderKey) {
    if (row.doesNotWantToBeMember()) {
        // console.log(row.getEmail())
        return false;
    }
    const key = row.getEmail() + '_' + reminderKey;
    let emailDateStr = await redisClient.get(key);
    const emailDate = emailDateStr === undefined ?
        row.getDateFormFilled() :
        moment(emailDateStr);
    const daysSinceLastEmail = moment().diff(emailDate, 'days');
    let shouldSend = daysSinceLastEmail > 31;
    return shouldSend ? {
            email: row.getEmail(),
            type: reminderKey
        } :
        false;
};

MembershipController._buildSheetsApi = function () {
    const auth = new google.auth.GoogleAuth({
        keyFile: GOOGLE_CREDENTIALS_FILE_PATH,
        scopes: GOOGLE_API_SCOPES,
    });
    return google.sheets({version: 'v4', auth});
};

module.exports = MembershipController;
