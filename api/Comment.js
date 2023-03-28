const express = require("express");
const router = express.Router();

const Dispenser = require("../models/Dispenser");
const Servicer = require("../models/Servicer");
const Facility = require("../models/Facility");

//TODO: prepravit kod na samo jedan poziv u bazu(updateOne) !
router.post("/addCommentToDispenser", (req, res) => {
    let { comment, invNumber } = req.body;

    if (comment == "" || invNumber == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        });

        return;
    }

    Dispenser.findOne({ invNumber }).then(dispenser => {
        if (dispenser) {
            Dispenser.updateOne({ invNumber }, { $push: { comment } }, (err, data) => {
                if (err) {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while trying to update comment"
                    });

                    return;
                }

                res.json({
                    status: "SUCCESS",
                    message: `Komentar uspiješno dodan na točionik: ${invNumber}`
                });
            })

            return;
        }

        Servicer.findOne({ "dispensers.invNumber": invNumber }).then(servicer => {
            if (servicer) {
                Servicer.updateOne({ "dispensers.invNumber": invNumber }, { $push: { "dispensers.$.comment": comment } }, (err, data) => {
                    if (err) {
                        res.json({
                            status: "FAILED",
                            message: "An error occured while trying to update comment"
                        });

                        return;
                    }

                    res.json({
                        status: "SUCCESS",
                        message: `Komentar uspiješno dodan na točionik: ${invNumber}`
                    });
                })

                return;
            }

            Facility.updateOne({ "dispensers.invNumber": invNumber }, { $push: { "dispensers.$.comment": comment } }, (err, data) => {
                if (err) {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while trying to update comment of dispenser at Facility"
                    });

                    return;
                }

                if (data.matchedCount === 1) {
                    res.json({
                        status: "SUCCESS",
                        message: `Komentar uspiješno dodan na točionik: ${invNumber}`
                    });

                    return;
                }

                res.json({
                    status: "FAILED",
                    message: `Točionik pod inventurnim brojem: ${invNumber}, ne postoji u vašoj bazi podataka!`
                });
            });
        });
    });
});

module.exports = router;