//mongo
require("./config/db")
//cors
const cors = require("cors");

const app = require("express")();
const port = 3000;

const UserRouter = require("./api/User");
const DispenserRouter = require("./api/Dispenser");

//For accepting post form data
const bodyParser = require("express").json;
app.use(bodyParser());

app.use(cors());

app.use("/user", UserRouter);
app.use("/dispenser", DispenserRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})