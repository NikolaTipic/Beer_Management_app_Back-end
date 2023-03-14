const express = require("express");
const router = express.Router();
const date = require("date-and-time")

//mongo db dispenser model
const Dispenser = require("../models/Dispenser");

//addDispenser
router.post("/addDispenser", (req, res) => {
    let { status, serialNum, invNumber, model, dateOfLastSanitation, comment } = req.body;

    if (invNumber == "" || serialNum == "" || model == "" || dateOfLastSanitation == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva obavezna polja!"
        });

        return;
    }

    status = status.toLowerCase();
    serialNum = serialNum.trim();
    serialNum = serialNum.toUpperCase();
    invNumber = invNumber.trim();
    invNumber = invNumber.toUpperCase();
    model = model.toUpperCase();

    //days to sanitation
    const now = new Date;
    const date2 = new Date(dateOfLastSanitation)
    const timePassed = date.subtract(now, date2);
    const daysPassed = timePassed.toDays();
    const roundDp = Math.round(daysPassed);
    const calcDaysToSanitation = 35 - roundDp;

    //checking if dispenser already exist
    Dispenser.find({ invNumber }).then(result => {
        if (result.length) {
            res.json({
                status: "FAILED",
                message: "Točionik s unsenim inventurnim brojem već postoji!"
            });

            return;
        }

        newDispenser = new Dispenser({
            status,
            serialNum,
            invNumber,
            model,
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

        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occurred while saving dispenser!"
            })
        });
    }).catch(err => {
        res.json({
            status: "FAILED",
            message: "An error occured while trying to find dispenser! "
        })
    });
});

//findDispenser
router.post("/findDispenser", (req, res) => {
    let { invNumber } = req.body;

    Dispenser.findOne({ invNumber }).then(result => {
        if (result.length) {
            res.json({
                status: "SUCCESS",
                message: "Dispenser retrived",
                data: result
            });

            return;
        }

        res.json({
            status: "FAILED",
            message: `Nema točionika pod inventurnim brojem: ${invNumber}`
        });
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

    Dispenser.find({ dts: { $lt: 15 } }).then(result => {
        if (result.length) {
            res.json({
                status: "SUCCESS",
                message: "Točionici uspiješno dohvaćeni",
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