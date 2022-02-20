const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DispenserSchema = new Schema({
    warehouse: String,
    invNumber: Number,
    model: String,
    location: {
        region: String,
        city: String,
        address: String
    },
    dateOfLastSanitation: Date,
    comment: String,
    dts: Number
});

const Dispenser = mongoose.model("Dispenser", DispenserSchema);

module.exports = Dispenser;