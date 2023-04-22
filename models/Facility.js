const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FacilitySchema = new Schema({
    id: Number,
    name: String,
    dispensers: [{
        serialNum: String,
        invNumber: String,
        model: String,
        status: String,
        comment: String,
        location: String,
        dts: Number
    }],
    parts: [{
        productName: String,
        productCode: String,
        quantity: Number,
        unit: String
    }],
    location: {
        city: String,
        address: String
    },
    comment: []
});

const Facility = mongoose.model("Facility", FacilitySchema);

module.exports = Facility;