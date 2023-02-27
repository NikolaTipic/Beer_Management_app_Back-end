const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ExpensesSchema = new Schema({
    productName: String,
    productCode: Number,
    quantity: Number,
    quantityUnit: String
});

const Expense = mongoose.model("Expense", ExpensesSchema);

module.exports = Expense;