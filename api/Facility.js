const express = require("express");
const router = express.Router();

const Facility = require("../models/Facility");
const Servicer = require("../models/Servicer");


//addFacility
router.post("/addFacility", (req, res) => {
    let { name, location, comment } = req.body;

    if (name == "" || location == "") {
        res.json({
            status: "FAILED",
            message: "Morate navesti ime objekta i lokaciju!"
        })
    } else {

        name = name.toUpperCase();
        //checking if Facility already exist
        Facility.find({ name }).then(result => {
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

    if (name == "") {
        res.json({
            status: "FAILED",
            message: "Morate navesti ime objekta kojeg zelite obrisati!"
        })
    } else {
        name = name.toUpperCase();

        Facility.find({ name }).then(result => {
            if (result.length) {
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


//fromFacilityToServicer
router.post("/fromFacilityToServicer", (req, res) => {
    let { name, facilityName, productCode, quantity } = req.body;

    if (productCode == "" || quantity == "" || name == "" || facilityName == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        });

        return;
    }
    // TODO read about database transactions (commit, rollback)

    facilityName = facilityName.toUpperCase();

    const fromFacilityToServicer = async function () {
        try {
            const selectedFacility = await Facility.findOne({ name: facilityName });
            if (!selectedFacility) {
                res.json({
                    status: "FAILED",
                    message: "Objekt pod unsenim imenom ne postoji u vasoj bazi podataka!"
                });
                return;
            }

            let partResult = selectedFacility.parts.find(item => item.productCode === productCode);
            if (!partResult) {
                res.json({
                    status: "FAILED",
                    message: `Objekt ${facilityName} nema proizvod pod šifrom: ${productCode}!`
                });
                return;
            }

            if (quantity > partResult.quantity) {
                res.json({
                    status: "FAILED",
                    message: `Objekt ${facilityName} nema toliku kolićinu proizvoda pod šifrom: ${productCode}, objekt ima: ${partResult.productName}-${partResult.quantity}!`
                });
                return;
            }

            const selectedServicer = await Servicer.findOne({ name });
            if (!selectedServicer) {
                res.json({
                    status: "FAILED",
                    message: `Serviser pod unesenim imenom: ${name} ne postoji u vasoj bazi podataka`
                });
                return;
            }

            Facility.updateOne({ name: facilityName, "parts.productCode": productCode }, { $inc: { "parts.$.quantity": -quantity } }, { new: true }, (error, data) => {
                if (error) {
                    res.json({
                        status: "FAILED",
                        message: `An Error has occured while trying to remove part from Facility`
                    });
                    return;
                }

                const servicerPartRes = selectedServicer.parts.find(item => item.productCode === productCode);
                if (!servicerPartRes) {
                    Servicer.updateOne({ name }, { $push: { parts: { productName: partResult.productName, productCode, quantity, unit: partResult.unit } } }, (error, data) => {
                        if (error) {
                            res.json({
                                status: "FAILED",
                                message: `An error occured while trying to add newPart to Servicer!`
                            });
                            return;
                        }

                        res.json({
                            status: "SUCCESS",
                            message: `Uspiješno ste razdužili Objekt: ${facilityName}: ${partResult.productName} -${quantity} i dodali novi proizvod Serviseru ${name}`
                        });
                    });
                } else {
                    Servicer.updateOne({ name, "parts.productCode": productCode }, { $inc: { "parts.$.quantity": quantity } }, { new: true }, (error, data) => {
                        if (error) {
                            res.json({
                                status: "FAILED",
                                message: `An error occured while trying to increment Part to Facility`
                            });
                            return;
                        }
                        res.json({
                            status: "SUCCESS",
                            message: `Uspiješno ste razdužili Objekt: ${facilityName}: ${partResult.productName} -${quantity} i dodali serviseru ${name}`
                        });
                    });
                }
            });

        } catch (error) {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find Facility! "
            });
        }
    }

    fromFacilityToServicer();
});


module.exports = router;