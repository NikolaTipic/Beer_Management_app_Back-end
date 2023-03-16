//mongo
require("./config/db");
//cors
const cors = require("cors");

const app = require("express")();
const port = process.env.PORT || 3000;

const UserRouter = require("./api/User");
const DispenserRouter = require("./api/Dispenser");
const PartRouter = require("./api/Parts");
const FacilityRouter = require("./api/Facility");

//For accepting post form data
const bodyParser = require("express").json;
app.use(bodyParser());

app.use(cors());

app.use("/user", UserRouter);
app.use("/dispenser", DispenserRouter);
app.use("/part", PartRouter);
app.use("/facility", FacilityRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})