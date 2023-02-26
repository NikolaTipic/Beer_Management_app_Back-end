const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServicersSchema = new Schema({
    productName: String,
    productCode: Number,
    servName: String,
    quantity: Number,
    quantityUnit: String
});

const Servicer = mongoose.model("Servicer", ServicersSchema);

module.exports = Servicer;