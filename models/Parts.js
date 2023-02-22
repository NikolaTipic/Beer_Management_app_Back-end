const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PartsSchema = new Schema({
    productName: String,
    productCode: Number,
    quantity: Number,
    quantityUnit: String
});

const Part = mongoose.model("Part", PartsSchema);

module.exports = Part;