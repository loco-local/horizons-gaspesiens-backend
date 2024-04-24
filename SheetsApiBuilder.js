const {google} = require("googleapis");
const config = require('./config')
const GOOGLE_CREDENTIALS_FILE_PATH = config.get().googleCredentialsFilePath;
const GOOGLE_API_SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

const SheetsApiBuilder = {
    build: function () {
        const auth = new google.auth.GoogleAuth({
            keyFile: GOOGLE_CREDENTIALS_FILE_PATH,
            scopes: GOOGLE_API_SCOPES,
        });
        return google.sheets({version: 'v4', auth});
    }
}
module.exports = SheetsApiBuilder;