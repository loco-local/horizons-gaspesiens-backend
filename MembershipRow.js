const moment = require("moment");

const HORODATEUR_ROW_INDEX = 0;
const EMAIL_ROW_INDEX = 4;
const SUBSCRIPTION_RENEWAL_DATE_INDEX = 17;
const DOES_NOT_WANT_MEMBERSHIP_INDEX = 19;

function MembershipRow(row) {
    this.row = row;
}

MembershipRow.prototype.getEmail = function () {
    const email = this.row[EMAIL_ROW_INDEX];
    return email.trim().toLowerCase();
};

MembershipRow.prototype.getStatus = function () {
    let renewalDate = this.row[SUBSCRIPTION_RENEWAL_DATE_INDEX];
    if (renewalDate === undefined || renewalDate.trim() === "") {
        return {
            status: "inactive",
            reason: "no renewal date"
        };
    }
    renewalDate = moment(renewalDate, "DD/MM/YYYY").add(1, 'Y').toDate()
    const isActive = new Date() < renewalDate;
    return {
        status: isActive ? "active" : "inactive",
        subscriptionRenewalDate: renewalDate.toString()
    };
};

MembershipRow.prototype.getDateFormFilled = function () {
    return moment(
        this.row[HORODATEUR_ROW_INDEX].substr(0, 10),
        'DD/MM/YYYY'
    );
};

MembershipRow.prototype.doesNotWantToBeMember = function () {
    return this.row[DOES_NOT_WANT_MEMBERSHIP_INDEX] === 'oui';
};

module.exports = MembershipRow;
