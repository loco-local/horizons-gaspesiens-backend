const COLUMNS_INDEX = {
    HORODATEUR_ROW_INDEX:0,
    FIRST_NAME_INDEX : 1,
    EMAIL_ROW_INDEX: 4,
    PAYMENT_DATE_INDEX: 18,
    SUBSCRIPTION_RENEWAL_DATE_INDEX: 19,
    DOES_NOT_WANT_MEMBERSHIP_INDEX: 21
}
const MembershipSpreadsheetColumnsIndex = {
    get: function(){
        return COLUMNS_INDEX;
    }
}

module.exports = MembershipSpreadsheetColumnsIndex;