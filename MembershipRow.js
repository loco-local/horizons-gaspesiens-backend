const Now = require("./Now");
const moment = require("moment");
require('moment/locale/fr');
moment.locale('fr')
const HORODATEUR_ROW_INDEX = 0;
const FIRST_NAME_INDEX = 1;
const EMAIL_ROW_INDEX = 4;
const PAYMENT_DATE_INDEX = 18;
const SUBSCRIPTION_RENEWAL_DATE_INDEX = 19;
const DOES_NOT_WANT_MEMBERSHIP_INDEX = 21;


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
    renewalDate = this._parseDateAtIndex(SUBSCRIPTION_RENEWAL_DATE_INDEX)
    renewalDate = renewalDate.add(1, 'Y').toDate()
    const isActive = Now.get().toDate() < renewalDate;
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

MembershipRow.prototype.getDateFormFilledFormatted = function () {
    return this.getDateFormFilled().format('LL')
};

MembershipRow.prototype.getRenewalDate = function () {
    return this._parseDateAtIndex(SUBSCRIPTION_RENEWAL_DATE_INDEX)
};

MembershipRow.prototype.getRenewalDateFormatted = function () {
    return this.getRenewalDate().format('LL');
};

MembershipRow.prototype.getPaymentDate = function () {
    return this._parseDateAtIndex(PAYMENT_DATE_INDEX)
};


MembershipRow.prototype.getExpirationDate = function () {
    return this.getRenewalDate().add(1, 'years').add(1, 'days');
};

MembershipRow.prototype.getExpirationDateFormatted = function () {
    return this.getExpirationDate().format('LL');
};


MembershipRow.prototype.doesNotWantToBeMember = function () {
    return this._getDoesNotWantToBeMemberValue() === 'oui';
};

MembershipRow.prototype._getDoesNotWantToBeMemberValue = function () {
    return this.row[DOES_NOT_WANT_MEMBERSHIP_INDEX];
}

MembershipRow.prototype.getFirstname = function () {
    return this.row[FIRST_NAME_INDEX];
}

MembershipRow.prototype._parseDateAtIndex = function (index) {
    const dateText = this.row[index]
    const doesDateStartWithYear = dateText.indexOf("/") >= 4;
    const dateFormat = doesDateStartWithYear ? 'YYYY/MM/DD' : 'DD/MM/YYYY'
    return moment(
        dateText,
        dateFormat
    )
}

module.exports = MembershipRow;
