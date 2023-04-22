//mongo
require("./config/db");
//cors
const cors = require("cors");
//excelJS
const excelJs = require("exceljs");
//express
const app = require("express")();
//model
const Facility = require("./models/Facility");

const dtsMinusOne = () => {
    Facility.updateMany({ "dispensers.status" : "active" }, {$inc: {"dispensers.$[elem].dts": -1}}, {arrayFilters: [{ "elem.status": "active" }]}, (error, data) => {
        if(error) {
            console.log(error);
        } else {
            console.log(data);
        }
    });
};

const port = process.env.PORT || 3000;

const UserRouter = require("./api/User");
const DispenserRouter = require("./api/Dispenser");
const PartRouter = require("./api/Parts");
const FacilityRouter = require("./api/Facility");
const ExcelRouter = require("./api/Excel");
const CommentRouter = require("./api/Comment")

//For accepting post form data
const bodyParser = require("express").json;
app.use(bodyParser());

app.use(cors());

app.use("/user", UserRouter);
app.use("/dispenser", DispenserRouter);
app.use("/part", PartRouter);
app.use("/facility", FacilityRouter);
app.use("/excel", ExcelRouter);
app.use("/comment", CommentRouter);


setInterval(dtsMinusOne, 1000 * 60 * 60 * 24);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})