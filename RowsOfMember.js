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

RowsOfMember.prototype.getRelevantRows = function () {
    return Object.keys(this.rowsOfMember).map((email) => {
        return this.getRelevantRowForEmail(email);
    })
}

RowsOfMember.prototype.getRelevantRowForEmail = function (email) {
    if (this.rowsOfMember[email] === undefined) {
        return false;
    }
    return this.rowsOfMember[email].sort((a, b) => {
        if(a.row.getStatus().status === "active" && b.row.getStatus().status !== "active"){
            return -1
        }
        if(b.row.getStatus().status === "active" && a.row.getStatus().status !== "active"){
            return 1
        }
        return b.row.getDateFormFilled().toDate() - a.row.getDateFormFilled().toDate();
    })[0]
}


module.exports = RowsOfMember;