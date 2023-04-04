const express = require("express");
const router = express.Router();

const Facility = require("../models/Facility");
const Servicer = require("../models/Servicer");


//addFacility
router.post("/addFacility", (req, res) => {
    let { id, name, location, comment } = req.body;
    let { city, address } = location;


    if (id === "" || name == "" || city == "" || address == "") {
        res.json({
            status: "FAILED",
            message: "Morate navesti ime objekta i lokaciju!"
        });

        return;
    }

    name = name.toUpperCase();

    //checking if Facility already exist
    Facility.find({ id }).then(result => {
        if (result.length) {

            res.json({
                status: "FAILED",
                message: `Objekt s navedenim ID-objekta :${id}, već postoji`
            });

            return;
        }

        //if part do not exist, create New
        newFacility = new Facility({
            id,
            name,
            location,
            comment
        })

        newFacility.save().then(result => {
            res.json({
                status: "SUCCESS",
                message: `Uspiješno ste dodali novi objekt: ${name}, na adresi: ${address}`,
                data: result,
            })

        }).catch(err => {
            console.log(err);
            res.json({
                status: "FAILED",
                message: "An error occurred while saving new Facility!"
            })
        });
    }).catch(err => {
        console.log(err);
        res.json({
            status: "FAILED",
            message: "An error occured while trying to find Facility! "
        });
    });
});


//deleteFacility
router.post("/deleteFacility", (req, res) => {
    let { id } = req.body;

    if (id === "") {
        res.json({
            status: "FAILED",
            message: "Morate navesti ID objekta kojeg zelite obrisati!"
        })
        return;
    }

    Facility.find({ id }).then(result => {
        if (result.length) {
            Facility.deleteOne({ id }).then(delResult => {
                res.json({
                    status: "SUCCESS",
                    message: `Objekt - ${id}, je uspiješno Obrisan`,
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
                message: `Objekt - ID: ${id}, ne postoji u vasoj bazi podataka!`
            });
        }
    }).catch(err => {
        res.json({
            status: "fAILED",
            message: "An error occured while trying to find Facility to delete it!"
        })
    })
});


//getFacilities
router.post("/getFacilities", (req, res) => {
    let { name } = req.body;

    if (name == "") {
        res.json({
            status: "FAILED",
            message: "Morate unijeti ime obijekta pod vašom nadležnosti!"
        });

        return;
    }

    name = name.toUpperCase();

    Facility.find({ name }).then(result => {
        if (result.length) {
            res.json({
                status: "SUCCESS",
                message: `Objekt ${name}, uspiješno pronađen!`,
                data: result
            });
        }
        else {
            res.json({
                status: "FAILED",
                message: `Objekt ${name}, nemate u vašoj bazi podataka objekata pod vašom nadležnosti`
            })
        }
    }).catch(err => {
        console.log(err);
        res.json({
            status: "FAILED",
            message: "An error occured while retreving expense inventory list!"
        })
    })
});


//fromFacilityToServicer
router.post("/fromFacilityToServicer", (req, res) => {
    let { name, id, productCode, quantity } = req.body;

    if (productCode == "" || quantity == "" || name == "" || id == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        });

        return;
    }
    // TODO read about database transactions (commit, rollback)

    const fromFacilityToServicer = async function () {
        try {
            const selectedFacility = await Facility.findOne({ id });
            if (!selectedFacility) {
                res.json({
                    status: "FAILED",
                    message: "Objekt pod unsenim ID-em ne postoji u vašoj bazi podataka!"
                });
                return;
            }

            let partResult = selectedFacility.parts.find(item => item.productCode === productCode);
            if (!partResult) {
                res.json({
                    status: "FAILED",
                    message: `Objekt ${selectedFacility.name} nema proizvod pod šifrom: ${productCode}!`
                });
                return;
            }

            if (quantity > partResult.quantity) {
                res.json({
                    status: "FAILED",
                    message: `Objekt ${selectedFacility.name} nema toliku količinu proizvoda pod šifrom: ${productCode}, objekt ima: ${partResult.productName}-${partResult.quantity}!`
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

            Facility.updateOne({ id, "parts.productCode": productCode }, { $inc: { "parts.$.quantity": -quantity } }, { new: true }, (error, data) => {
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
                            message: `Uspiješno ste razdužili Objekt: ${selectedFacility.name}: ${partResult.productName} -${quantity} i dodali novi proizvod Serviseru ${name}`
                        });
                    });
                } else {
                    Servicer.updateOne({ name, "parts.productCode": productCode }, { $inc: { "parts.$.quantity": quantity } }, { new: true }, (error, data) => {
                        if (error) {
                            res.json({
                                status: "FAILED",
                                message: `An error occured while trying to increment Part to Servicer`
                            });
                            return;
                        }
                        res.json({
                            status: "SUCCESS",
                            message: `Uspiješno ste razdužili Objekt: ${selectedFacility.name}: ${partResult.productName} -${quantity} i dodali serviseru ${name}`
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


//dispenserFromFacilityToServicer
router.post("/dispenserFromFacilityToServicer", (req, res) => {
    let { name, invNumber, id } = req.body;

    if (invNumber == "" || name == "" || id == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        });

        return;
    }

    //checking if servicer exist
    Facility.findOne({ id }).then(facilityRes => {
        if (facilityRes) {

            const dispenser = facilityRes.dispensers.find(item => item.invNumber === invNumber);
            if (dispenser) {
                Servicer.findOne({ name }).then(servResult => {
                    if (servResult) {
                        Servicer.updateOne({ name }, { $push: { dispensers: { serialNum: dispenser.serialNum, invNumber, model: dispenser.model, status: "inactive", comment: dispenser.comment, location: servResult.name } } }, (error, data) => {
                            if (error) {
                                res.json({
                                    status: "FAILED",
                                    message: "An error occured while pushing dispenser to servicer"
                                });

                                return;
                            }

                            Facility.updateOne({ id }, { $pull: { dispensers: { invNumber } } }).then(result => {
                                res.json({
                                    status: "SUCCESS",
                                    message: `Uspiješno ste prebacili točionik: ${invNumber}, na servisera: ${servResult.name}, sa objekta: ${id}`
                                });
                            }).catch(err => {
                                res.json({
                                    status: "FAILED",
                                    message: "An error occured while pulling dispenser from Facility collection"
                                });
                            });

                        });

                        return;
                    }

                    res.json({
                        status: "FAILED",
                        message: `Serviser: ${name}, ne postoji u vasoj bazi podataka`
                    });
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while trying to find servicer! "
                    })
                });

                return;
            }

            res.json({
                status: "FAILED",
                message: `Objekt: ${id}, nema točionik pod inventrunim brojem: ${invNumber}!`
            });

            return;
        }

        //handling errors
        res.json({
            status: "FAILED",
            message: `Objekt: ${id}, ne postoji u vašoj bazi podataka!`
        });
    }).catch(err => {
        res.json({
            status: "FAILED",
            message: "An error occured while trying to find Facility! "
        })
    });
});


//addDateOfLastSanitation
router.post("/addDateOfLastSanitation", (req, res) => {
    let { dateOfLastSanitation, invNumber } = req.body;

    if (dateOfLastSanitation == "" || invNumber == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja! "
        });

        return;
    }

    invNumber = invNumber.trim();
    invNumber = invNumber.toUpperCase();

    Facility.updateOne({ "dispensers.invNumber": invNumber }, { $set: { "dispensers.$.dols": new Date(dateOfLastSanitation) } }, (err, data) => {
        if (err) {
            console.log(err);
            res.json({
                status: FAILED,
                message: "An error has occured while trying to set dateOfLastSanitation"
            });

            return;
        }

        if (data.matchedCount === 1) {
            if (data.modifiedCount === 1) {
                res.json({
                    status: "SUCCESS",
                    message: `Sanitacija je potvrđena, dana: ${new Date(dateOfLastSanitation).toDateString()} - ${invNumber}`
                });

                Facility.updateOne({ "dispensers.invNumber": invNumber }, {$set: {"dispensers.$.status" : "active"}}, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.json({
                            status: FAILED,
                            message: "An error has occured while trying to set status to active"
                        });
            
                        return;
                    }
                });
            } else {
                res.json({
                    status: "FAILED",
                    message: `Sanitacija je vec napravljena pod tim datumom, na inventurni broj: ${invNumber} !`
                })
            }

            return;
        }

        res.json({
            status: "FAILED",
            message: `Točionik pod inventurnim brojem: ${invNumber}, ne pripada ni jedom objektu pod vašom nadležnosti!`
        });
    });
});


module.exports = router;