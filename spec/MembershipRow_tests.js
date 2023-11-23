require("./TestUtil");
let data = {};
const config = require("../config");
const MembershipController = require("../controller/MembershipController");
const MembershipRow = require("../MembershipRow");
describe('MembershipRow', () => {
    beforeEach(() => {
        data = {};
    });
    xit("returns correct values", async () => {
        const chenzoRow = await getChenzoRow();
        console.log(chenzoRow.row);
        chenzoRow.getPaymentDate().format('DD/MM/YYYY').should.equal("18/10/2022");
        chenzoRow.getRenewalDate().format('DD/MM/YYYY').should.equal("17/10/2022");
        chenzoRow._getDoesNotWantToBeMemberValue().should.equal("nah");
    });

    async function getChenzoRow() {
        const sheets = MembershipController._buildSheetsApi();
        return new Promise((resolve) => {
            sheets.spreadsheets.values.get({
                spreadsheetId: config.get().spreadSheetId,
                range: MembershipController._getCellsRange(),
            }, (err, sheetsRes) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = sheetsRes.data.values;
                const chenzoRow = rows.map((row) => {
                    const membershipRow = new MembershipRow(row);
                    // console.log(membershipRow.getEmail())
                    return membershipRow;
                }).filter((row) => {
                    return row.getEmail() === "vincent.blouin@gmail.com"
                })[0];
                resolve(chenzoRow);
            });
        })
    }
});
