const express = require("express");
const router = express.Router();
const date = require("date-and-time")

//mongo db dispenser model
const Dispenser = require("../models/Dispenser");
const Servicer = require("../models/Servicer");

//addDispenser
router.post("/addDispenser", (req, res) => {
    let { serialNum, invNumber, model, comment } = req.body;

    if (invNumber == "" || serialNum == "" || model == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva obavezna polja!"
        });

        return;
    }

    serialNum = serialNum.trim();
    serialNum = serialNum.toUpperCase();
    invNumber = invNumber.trim();
    invNumber = invNumber.toUpperCase();
    model = model.toUpperCase();

    //days to sanitation
    // const now = new Date;
    // const date2 = new Date(dateOfLastSanitation)
    // const timePassed = date.subtract(now, date2);
    // const daysPassed = timePassed.toDays();
    // const roundDp = Math.round(daysPassed);
    // const calcDaysToSanitation = 35 - roundDp;

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
            serialNum,
            invNumber,
            model,
            comment,
            status: "inactive"
            ///dts: calcDaysToSanitation
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
        if (result) {
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
});

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
});



//dispenerfromCentralToServicer
router.post("/dispenerfromCentralToServicer", (req, res) => {
    let { name, invNumber } = req.body;

    if (invNumber == "" || name == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        });

        return;
    }

    //checking if dispenser exist
    Dispenser.findOne({ invNumber }).then(dispenserResult => {
        if (dispenserResult) {
            Servicer.findOne({ name }).then(resultName => {
                if (resultName) {
                    Servicer.updateOne({name}, {$push: {dispensers: {serialNum: dispenserResult.serialNum, invNumber, model: dispenserResult.model, status: dispenserResult.status, comment: dispenserResult.comment, location: name }}}, (error, data) => {
                        if(error) {
                            res.json({
                                status: "FAILED",
                                message: "An error occured while trying to push dispenser to servicer"
                            });

                            return;
                        }

                        Dispenser.deleteOne({ invNumber }).then(reusult => {
                            res.json({
                                status: "SUCCESS",
                                message: `Serviseru: ${name}, ste uspiješno dodali točionik: ${invNumber}`
                            });
                        }).catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occured while trying to delete the dispenser!"
                            });
                        })
                    })

                    return;
                }

                res.json({
                    status: "FAILED",
                    message: `Serviser imenom: ${name}, ne postoji u vasoj bazi podataka`
                });
            });

            return;
        }

        //handling errors
        res.json({
            status: "FAILED",
            message: `Točionik pod inventurnim brojem: ${invNumber}, ne postoji na vašem centralnom skladištu!`
        });
    }).catch(err => {
        res.json({
            status: "FAILED",
            message: "An error occured while trying to find dispenser! "
        })
    });
});

module.exports = router;