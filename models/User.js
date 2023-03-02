const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: String,
    email: String,
    password: String,
    administrator: Boolean,
    dispensers: [{
        serialNumber: Number,
        inventurniNumber: String,
        type: String
    }],
    parts: [{partName: String}] 
});

const User = mongoose.model("User", UserSchema);

module.exports = User;