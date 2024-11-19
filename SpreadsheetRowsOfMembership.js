const config = require("./config");
const SheetsApiBuilder = require("./SheetsApiBuilder");
const cellsRange = 'A2:V';

const SpreadsheetRowsOfMembership = {
    get: function () {
        return new Promise((resolve) => {
            const sheets = SheetsApiBuilder.build();
            sheets.spreadsheets.values.get({
                spreadsheetId: config.get().spreadSheetId,
                range: cellsRange,
            }, (err, sheetsRes) => {
                if (err) {
                    console.log('The API returned an error: ' + err);
                    resolve(false);
                } else {
                    resolve(sheetsRes.data.values);
                }
            });
        })
    },
    _getCellsRange: function () {
        return cellsRange;
    }
}
module.exports = SpreadsheetRowsOfMembership;