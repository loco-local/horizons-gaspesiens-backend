const config = require("./config");
const MembershipRow = require("./MembershipRow");
const valueToConfirmIntegrity = "valeur_pour_confirmer_test_du_code";
const UpToDateWithSpreadsheetColumnsValidator = {
    isValid: function (rows) {
        let rowToTest = rows.filter((row) => {
            const membershipRow = new MembershipRow(row);
            return membershipRow.getEmail() === config.get().memberEmailToTestIntegrityOfSpreadsheet
        })
        if (rowToTest.length === 0) {
            return {
                isValid: false,
                error: "ne peux trouver la rangée du memberEmailToTestIntegrityOfSpreadsheet"
            }
        }
        rowToTest = new MembershipRow(rowToTest[0]);
        if(rowToTest.getDoesNotWantToBeMemberValue() !== valueToConfirmIntegrity){
            return {
                isValid: false,
                error: "la valeur pour la colonne 'Ne veux pas être membre' de l'usager test pour confirmer l'intégriter n'est pas bonne"
            }
        }
        return {
            isValid: true
        }
    }
}

module.exports = UpToDateWithSpreadsheetColumnsValidator