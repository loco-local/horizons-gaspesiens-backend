function RowsOfMember() {
    this.rowsOfMember = {};
}

RowsOfMember.prototype.addRow = function (row, reminder) {
    if (this.rowsOfMember[row.getEmail()] === undefined) {
        this.rowsOfMember[row.getEmail()] = []
    }
    this.rowsOfMember[row.getEmail()].push({
        row: row,
        reminder: reminder
    })
}


RowsOfMember.prototype.getReminderRelevantRows = function () {
    return Object.keys(this.rowsOfMember).map((email) => {
        return this.getReminderRelevantRow(email);
    })
}

RowsOfMember.prototype.getEmailsHavingMultipleRows = function () {
    return Object.keys(this.rowsOfMember).filter((email) => {
        return this.rowsOfMember[email].length > 1;
    })
}

RowsOfMember.prototype.getStatusRelevantRowForEmail = function (email) {
    if (this.rowsOfMember[email] === undefined) {
        return false;
    }
    return this.rowsOfMember[email].sort((a, b) => {
        if (a.row.getStatus().status === "active" && b.row.getStatus().status !== "active") {
            return -1
        }
        if (b.row.getStatus().status === "active" && a.row.getStatus().status !== "active") {
            return 1
        }
        return this._sortByLatestFormFill(a, b);
    })[0]
}

RowsOfMember.prototype.getReminderRelevantRow = function (email) {
    if (this.rowsOfMember[email] === undefined) {
        return false;
    }
    return this.rowsOfMember[email].sort(this._sortByLatestFormFill)[0]
}

RowsOfMember.prototype._sortByLatestFormFill = function (a, b) {
    return b.row.getDateFormFilled().toDate() - a.row.getDateFormFilled().toDate();
}

module.exports = RowsOfMember;