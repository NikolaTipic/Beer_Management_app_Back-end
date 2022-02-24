const express = require("express");
const router = express.Router();
const date = require("date-and-time")

//mongo db dispenser model
const Dispenser = require("../models/Dispenser");

//addDispenser
router.post("/addDispenser", (req, res) => {
    let {warehouse, invNumber, model, location, dateOfLastSanitation, comment} = req.body;

    warehouse = warehouse.toLowerCase();
    invNumber = invNumber.trim();
    model = model.toLowerCase();
    model = model.trim();
    location.region = location.region.toLowerCase();
    location.region = location.region.trim();
    location.city = location.city.toLowerCase();
    location.city = location.city.trim();
    location.address = location.address.toLowerCase();

    //days to sanitation
    const now = new Date;
    const date2 = new Date(dateOfLastSanitation)
    const timePassed = date.subtract(now, date2);
    const daysPassed = timePassed.toDays();
    const roundDp = Math.round(daysPassed);
    const calcDaysToSanitation = 35 - roundDp;

    if(invNumber == "" || model == "" || model == "" || dateOfLastSanitation == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        })
    } else {
        //checking if dispenser already exist
        Dispenser.find({invNumber}).then(result =>{
            if (result.length) {
                res.json({
                    status: "FAILED",
                    message: "Točionik s unsenim inventurnim brojem već postoji!"
                })
            }
            else {
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
                        message: "Točionik dodan",
                        data: result,
                    })
                
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while saving dispenser!"
                    })
                })
            }
        }). catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find dispenser! "
            })
        })
    }
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

//chech for dispensers that have less than 16 days to sanitation
router.post("/checkForExpiredSanitation", (req, res) => {

    Dispenser.find({dts: {$lt: 15}}).then( result => {
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
                message: "Na svim tocionicima je obavljena sanitacija"
            })
        }
    }).catch(err => {
        console.log(err);
        res.json({
            status: "FAILED",
            message: "An error occured while retreving list of expired snitation dispensers!"
        })
    })
})

module.exports = router;