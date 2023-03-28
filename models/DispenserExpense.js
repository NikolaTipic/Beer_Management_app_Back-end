const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DispenserExpensesSchema = new Schema({
    status: String,
    serialNum: String,
    invNumber: String,
    model: String,
    location: String,
    comment: []
});

const DispenserExpense = mongoose.model("Dispenser_Expense", DispenserExpensesSchema);

module.exports = DispenserExpense;