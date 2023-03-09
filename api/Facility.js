const express = require("express");
const router = express.Router();

const Facility = require("../models/Facility");


//addFacility
router.post("/addFacility", (req, res) => {
    let { name, location, comment } = req.body;

    if ( name == "" || location == "" ) {
        res.json({
            status: "FAILED",
            message: "Morate navesti ime objekta i lokaciju!"
        })
    } else {

        name = name.toUpperCase();
        //checking if Facility already exist
        Facility.find({name}).then(result => {
            if (result.length) {
                
                res.json({
                    status: "FAILED",
                    message: `Objekt s navedenim imenom: ${name}, već postoji`
                })
            }

            //if part do not exist, create New
            else {
                newFacility = new Facility({
                    name,
                    location,
                    comment
                })

                newFacility.save().then(result => {
                    res.json({
                        status: "SUCCESS",
                        message: `Uspiješno ste dodali novi objekt: ${name}, na adresi: ${location.address}`,
                        data: result,
                    })

                })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occurred while adding new Facility!"
                        })
                    })
            }
        }).catch(err => {
            console.log(err)
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find Facility! "
            })
        })
    }
});


//deleteFacility
router.post("/deleteFacility", (req, res) => {
    let { name } = req.body;

    if ( name == "" ) {
        res.json({
            status: "FAILED",
            message: "Morate navesti ime objekta kojeg zelite obrisati!"
        })
    } else {
        name = name.toUpperCase();
        
        Facility.find({ name }).then(result => {
            if(result.length) {
                Facility.deleteOne({ name }).then(delResult => {
                    res.json({
                        status: "SUCCESS",
                        message: `Objekt ${name} je uspiješno Obrisan`,
                        data: delResult
                    });
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while trying to delete Facility!",
                    })
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: `Objekt s imenom: ${name}, ne postoji u vasoj bazi podataka!`
                });
            }
        }).catch(err => {
            res.json({
                status: "fAILED",
                message: "An error occured while trying to find Facility to delete it!"
            })
        })
    }
});


module.exports = router;