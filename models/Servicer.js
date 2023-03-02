const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ServicersSchema = new Schema({
    name: String,
    dispensers: [{}],
    parts: [{
        productName: String,
        productCode: String,
        quantity: Number,
        unit: String
    }]
});

const Servicer = mongoose.model("Servicer", ServicersSchema);

module.exports = Servicer;