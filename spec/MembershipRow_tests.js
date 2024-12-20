require("./TestUtil");
const config = require("../config");
const MembershipController = require("../controller/MembershipController");
const MembershipRow = require("../MembershipRow");
const SheetsApiBuilder = require("../SheetsApiBuilder");
const SpreadsheetRowsOfMembership = require("../SpreadsheetRowsOfMembership");
describe('MembershipRow', () => {
    beforeEach(() => {
    
    });
    xit("returns correct values", async () => {
        const chenzoRow = await getChenzoRow();
        console.log(chenzoRow.row);
        chenzoRow.getPaymentDate().format('DD/MM/YYYY').should.equal("18/10/2022");
        chenzoRow.getRenewalDate().format('DD/MM/YYYY').should.equal("17/10/2022");
        chenzoRow.getDoesNotWantToBeMemberValue().should.equal("valeur_pour_confirmer_test_du_code");
    });

    xit("returns correct values", async () => {
        const chenzoRow = await getChenzoRow();
        console.log(chenzoRow.row);
        chenzoRow.getPaymentDate().format('DD/MM/YYYY').should.equal("18/10/2022");
        chenzoRow.getRenewalDate().format('DD/MM/YYYY').should.equal("17/10/2022");
        chenzoRow.getDoesNotWantToBeMemberValue().should.equal("valeur_pour_confirmer_test_du_code");
    });

    xit("can have inverse date", async () => {
        const inverseDateRow = await getInverseDateRow();
        console.log(inverseDateRow.row);
        inverseDateRow.getPaymentDate().format('DD/MM/YYYY').should.equal("05/02/2024");
        inverseDateRow.getRenewalDate().format('DD/MM/YYYY').should.equal("05/02/2024");
        inverseDateRow.getDoesNotWantToBeMemberValue().should.equal("nah");
    });

    async function getChenzoRow() {
        return _getRowWithEmail(
            "vincent.blouin@gmail.test"
        )
    }

    async function getInverseDateRow() {
        return _getRowWithEmail(
            "date@inverse.test"
        )
    }

    async function _getRowWithEmail(email) {
        const sheets = SheetsApiBuilder.build()
        return new Promise((resolve) => {
            sheets.spreadsheets.values.get({
                spreadsheetId: config.get().spreadSheetId,
                range: SpreadsheetRowsOfMembership._getCellsRange(),
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
