const {google} = require('googleapis');
const config = require('../config')
const googleApiKey = config.getConfig().googleApiKey
const EMAIL_ROW_INDEX = 4;
const SUBSCRIPTION_RENEWAL_DATE_INDEX = 17;
const moment = require("moment");
const MembershipController = {
    async get(req, res) {
        const {email} = req.body
        let emailToFind = email;
        const sheets = google.sheets({version: 'v4', auth: googleApiKey});
        let rowsWithEmail = [];
        sheets.spreadsheets.values.get({
            spreadsheetId: '1_KH43HPFDERGgB6wmQEPS-cujtw10YKS4I7X3S6Mwio',
            range: 'A2:T',
        }, (err, sheetsRes) => {
            if (err) return console.log('The API returned an error: ' + err);
            const rows = sheetsRes.data.values;
            if (rows.length) {
                // Print columns A and E, which correspond to indices 0 and 4.
                rowsWithEmail = rows.filter((row) => {
                    const email = row[EMAIL_ROW_INDEX];
                    return email.trim().toLowerCase() === emailToFind.trim().toLowerCase();
                });
                if (!rowsWithEmail.length) {
                    return res.send({
                        status: "inactive",
                        reason: "email not found"
                    });
                }
                const rowWithEmail = rowsWithEmail[0];
                let renewalDate = rowWithEmail[SUBSCRIPTION_RENEWAL_DATE_INDEX];
                if (renewalDate.trim() === "") {
                    return res.send({
                        status: "inactive",
                        reason: "no renewal date"
                    });
                }
                renewalDate = moment(renewalDate, "DD/MM/YYYY").add(1, 'Y').toDate()
                const isActive = new Date() < renewalDate;
                res.send({
                    status: isActive ? "active" : "inactive",
                    subscriptionRenewalDate: renewalDate.toString()
                })
            } else {
                console.log('No data found.');
                res.sendStatus(400);
            }
        });
    }
}


module.exports = MembershipController;
