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

    xit("returns correct values", async () => {
        const chenzoRow = await getChenzoRow();
        console.log(chenzoRow.row);
        chenzoRow.getPaymentDate().format('DD/MM/YYYY').should.equal("18/10/2022");
        chenzoRow.getRenewalDate().format('DD/MM/YYYY').should.equal("17/10/2022");
        chenzoRow._getDoesNotWantToBeMemberValue().should.equal("nah");
    });

    xit("can have inverse date", async () => {
        const inverseDateRow = await getInverseDateRow();
        console.log(inverseDateRow.row);
        inverseDateRow.getPaymentDate().format('DD/MM/YYYY').should.equal("05/02/2024");
        inverseDateRow.getRenewalDate().format('DD/MM/YYYY').should.equal("05/02/2024");
        inverseDateRow._getDoesNotWantToBeMemberValue().should.equal("nah");
    });

    async function getChenzoRow() {
        return _getRowWithEmail(
            "vincent.blouin@gmail.com"
        )
    }

    async function getInverseDateRow() {
        return _getRowWithEmail(
            "date@inverse.com"
        )
    }

    async function _getRowWithEmail(email) {
        const sheets = MembershipController._buildSheetsApi();
        return new Promise((resolve) => {
            sheets.spreadsheets.values.get({
                spreadsheetId: config.get().spreadSheetId,
                range: MembershipController._getCellsRange(),
            }, (err, sheetsRes) => {
                if (err) return console.log('The API returned an error: ' + err);
                const rows = sheetsRes.data.values;
                const foundRow = rows.map((row) => {
                    const membershipRow = new MembershipRow(row);
                    // console.log(membershipRow.getEmail())
                    return membershipRow;
                }).filter((row) => {
                    return row.getEmail() === email
                })[0];
                resolve(foundRow);
            });
        })
    }
});
