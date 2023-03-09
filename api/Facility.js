const express = require("express");
const router = express.Router();

const Facility = require("../models/Facility");
const Servicer = require("../models/Servicer");


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


//fromFacilityToServicer
router.post("/fromFacilityToServicer", (req, res) => {
    let { name, facilityName, productCode, quantity } = req.body;

    if (productCode == "" || quantity == "" || name == "" || facilityName == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        });
    } else {
        //checking if servicer exist
        facilityName = facilityName.toUpperCase();

        Facility.find({name: facilityName}).then(facResult => {
            if(facResult.length) {
                Facility.find({ name: facilityName, "parts.productCode": productCode }).then(facPartResult => {
                    if(facPartResult.length) {
                        Servicer.find({ name }).then(nameResult => {
                            if(nameResult.length) {
                                Facility.updateOne({ name: facilityName, "parts.productCode": productCode }, { $inc: { "parts.$.quantity": -quantity } }, { new: true }, (error, data) => {
                                    if(error) {
                                        res.json({
                                            status: "FAILED",
                                            message: "An error occured while trying to reduce part quantity from Facility!"
                                        });
                                    } else {
                                        Servicer.find({ name, "parts.productCode": productCode }).then(resultpart => {
                                            if(resultpart.length) {
                                                Servicer.updateOne({ name, "parts.productCode": productCode }, { $inc: { "parts.$.quantity": quantity } }, { new: true }, (error, data) => {
                                                    if(error) {
                                                        res.json({
                                                            status: "FAILED",
                                                            message: "An error occured while trying to add part to Servicer!"
                                                        });
                                                    } else {//dovrsit odavde i napraviti provjeru ima li ih dovoljno u obijektu!
                                                        res.json({
                                                            status: "SUCCESS",
                                                            message: `Uspiješno ste razdužili Obijekt: ${facilityName}: ${result[0].parts[0].productName} +${quantity} i dodali obijektu ${facilityName}`
                                                        });
                                                    }
                                                });
                                            } else {

                                            }
                                        })
                                    }
                                });
                            } else {
                                res.json({
                                    status: "FAILED",
                                    message: "Serviser pod unsenim imenom ne postoji u vasoj bazi podataka!"
                                });
                            }
                        }).catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occured while trying to find servicer name!"
                            });
                        });
                    } else {
                        res.json({
                            status: "FAILED",
                            message: `Objekt po imenom ${facilityName} nema proizvod pod Šifrom: ${productCode}!`
                        });
                    }
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while trying to find part in Facility! "
                    });
                });
            } else {
                res.json({
                    status: "FAILED",
                    message: `Objekt po imenom ${facilityName} ne postoji!`
                });
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find Facility! "
            })
        });
        
        Servicer.find({ name }).then(resultName => {
            if (resultName.length) {
                Servicer.find({ name, "parts.productCode": productCode }).then(resultpart => {
                    if (resultpart.length) {
                        Facility.find({ name: facilityName }).then(facResult => {
                            if(facResult.length) {
                                Servicer.find({name, "parts.productCode": productCode}, {"parts.$": 1}).then(result => {
                                    if(result[0].parts[0].quantity >= quantity) {
                                        Servicer.updateOne({ name, "parts.productCode": productCode }, { $inc: { "parts.$.quantity": -quantity } }, { new: true }, (error, data) => {
                                            if (error) {
                                                res.json({
                                                    status: "FAILED",
                                                    message: `Error has occured while trying to remove part from Sericer ${name}, check your internet connection`
                                                });
                                            }
                                            else {
                                                Facility.find({ name: facilityName, "parts.productCode": productCode }).then(facPartResult => {
                                                    if(facPartResult.length) {
                                                        Facility.updateOne({ name: facilityName, "parts.productCode": productCode }, { $inc: { "parts.$.quantity": quantity } }, { new: true }, (error, data) => {
                                                            if (error) {
                                                                res.json({
                                                                    status: "FAILED",
                                                                    message: `An error occured while trying to increment Part to Facility, check your internet connection!`
                                                                });
                                                            }
                                                            else {
                                                                res.json({
                                                                    status: "SUCCESS",
                                                                    message: `Uspiješno ste razdužili Servisera: ${name}: ${result[0].parts[0].productName} +${quantity} i dodali obijektu ${facilityName}`
                                                                });
                                                            }
                                                        });
                                                    }else {
                                                        Facility.updateOne({ name: facilityName }, { $push: { parts: { productName: result[0].parts[0].productName, productCode, quantity, unit: result[0].parts[0].unit } } }, (error, data) => {
                                                            if (error) {
                                                                res.json({
                                                                    status: "FAILED",
                                                                    message: `An error occured while trying to add newPart to Facility, check your internet connection!`
                                                                });
                                                            }
                                                            else {
                                                                res.json({
                                                                    status: "SUCCESS",
                                                                    message: `Uspiješno ste razdužili Servisera: ${name}: ${result[0].parts[0].productName} +${quantity} i dodali obijektu novi proizvod ${facilityName}`
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    } else {
                                        res.json({
                                            status: "FAILED",
                                            message: `Serviser: ${name}, nema toliku kolicinu, ${name} ima: ${result[0].parts[0].quantity} - ${result[0].parts[0].productName}`
                                        });
                                    }
                                });
                            } else {
                                res.json({
                                    status: "FAILED",
                                    message: `Objekt po imenom ${facilityName} ne postoji, molimo dodajte novi objekt u bazu podataka!`
                                });
                            }
                        });
                    } else {
                        res.json({
                            status: "FAILED",
                            message: `Serviser: ${name} nema proizvod pod unesenom šifrom - ${productCode}`
                        });
                    }
                });
            } else {
                res.json({
                    status: "FAILED",
                    message: "Serviser pod unsenim imenom ne postoji u vasoj bazi podataka!"
                });
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find servicer! "
            })
        });
    }
});


module.exports = router;