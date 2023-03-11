const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FacilitySchema = new Schema({
    id: Number,
    name: String,
    dispensers: [{}],
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
    comment: String,
});

const Facility = mongoose.model("Facility", FacilitySchema);

module.exports = Facility;