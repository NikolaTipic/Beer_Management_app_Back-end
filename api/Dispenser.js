const express = require("express");
const router = express.Router();
const date = require("date-and-time")

//mongo db dispenser model
const Dispenser = require("../models/Dispenser")

//addDispenser
router.post("/addDispenser", (req, res) => {
    let {warehouse, invNumber, model, location, dateOfLastSanitation, comment} = req.body;

    //days to sanitation
    const now = new Date;
    const date2 = new Date(dateOfLastSanitation)
    const timePassed = date.subtract(now, date2);
    const daysPassed = timePassed.toDays();
    const roundDp = Math.round(daysPassed);
    const calcDaysToSanitation = 35 - roundDp;


    newDispenser = new Dispenser({
        warehouse,
        invNumber,
        model,
        location,
        dateOfLastSanitation,
        comment,
        dts: calcDaysToSanitation
    })

    newDispenser.save().then(result => {
        res.json({
            status: "SUCCESS",
            message: "Dispenser added",
            data: result,
        })
    
    })
    .catch(err => {
        res.json({
            status: "FAILED",
            message: "An error occurred while saving user account"
        })
    })
})

//findDispenser
router.post("/findDispenser", (req, res) => {
    let {invNumber} = req.body;

    Dispenser.find({invNumber}).then(result => {
        if (result.length) {
            res.json({
                status: "SUCCESS",
                message: "Dispenser retrived",
                data: result
            });
        }
        else {
            res.json({
                status: "FAILED",
                message: "No dispenser found"
            })
        }
    }).catch(err => {
        console.log(err);
        res.json({
            status: "FAILED",
            message: "An error occured while retrving dispenser"
        })
    })
})

module.exports = router;