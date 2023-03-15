const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DispenserSchema = new Schema({
    status: String,
    serialNum: String,
    invNumber: String,
    model: String,
    location: String,
    dateOfLastSanitation: Date,
    comment: String,
    dts: Number
});

const Dispenser = mongoose.model("Dispenser", DispenserSchema);

module.exports = Dispenser;