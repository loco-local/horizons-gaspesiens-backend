const SpreadsheetRowsOfMembership = require("../SpreadsheetRowsOfMembership");
const UpToDateWithSpreadsheetColumnsValidator = require("../UpToDateWithSpreadsheetColumnsValidator");
const MembershipSpreadsheetColumnsIndex = require("../MembershipSpreadsheetColumnsIndex");
const index = MembershipSpreadsheetColumnsIndex.get();
const config = require('../config')
const MembershipRow = require("../MembershipRow");
describe('UpToDateWithSpreadsheetColumnsValidator', () => {
    xit("returns not valid if row of member to test integrity is missing", async () => {
        let rowsOfSpreadsheet = await SpreadsheetRowsOfMembership.get();
        let isValid = UpToDateWithSpreadsheetColumnsValidator.isValid(rowsOfSpreadsheet)
        isValid.isValid.should.equal(true);
        rowsOfSpreadsheet = rowsOfSpreadsheet.filter((row) => {
            const membershipRow = new MembershipRow(row);
            return membershipRow.getEmail() !== config.get().memberEmailToTestIntegrityOfSpreadsheet
        })
        isValid = UpToDateWithSpreadsheetColumnsValidator.isValid(rowsOfSpreadsheet)
        isValid.isValid.should.equal(false);
    });
    xit("returns not valid if don't want to be member value is wrong", async () => {
        let rowsOfSpreadsheet = await SpreadsheetRowsOfMembership.get();
        const row = getTestRow(rowsOfSpreadsheet);
        row[index.DOES_NOT_WANT_MEMBERSHIP_INDEX] = "nah"
        let isValid = UpToDateWithSpreadsheetColumnsValidator.isValid(rowsOfSpreadsheet)
        isValid.isValid.should.equal(false);
    });

    function getTestRow(rowsOfSpreadsheet) {
        let found = rowsOfSpreadsheet.filter((row) => {
            const membershipRow = new MembershipRow(row);
            return membershipRow.getEmail() === config.get().memberEmailToTestIntegrityOfSpreadsheet
        })
        return found[0]
    }
})