const express = require("express");
const router = express.Router();
//excelJS
const excelJs = require("exceljs");
//nodemailer
const nodemailer = require("nodemailer");
//mongo model
const Facility = require("../models/Facility");
const Dispenser = require("../models/Dispenser");
const DispenserExpense = require("../models/DispenserExpense");
const Part = require("../models/Parts");
const Expense = require("../models/Expense");



router.get("/exportFacilityXlsx", (req, res) => {
    Facility.find({}).then(result => {
        let workbook = new excelJs.Workbook();

        const sheet = workbook.addWorksheet("objekti");
        sheet.columns = [
            { header: "ID Objekta", key: "id", width: 25 },
            { header: "Naziv Objekta", key: "name", width: 25 },
            { header: "Adresa", key: "address", width: 25 },
            { header: "Naziv mjesta", key: "city", width: 25 },
            { header: "Točionici", key: "dispensers", width: 75 },
            { header: "Djelovi", key: "parts", width: 50 }
        ];



        result.map((facility, index) => {
            sheet.addRow({
                id: facility.id,
                name: facility.name,
                address: facility.location.address,
                city: facility.location.city,
                dispensers: facility.dispensers.map((dis, index) => { return `Točionik ${index + 1}:  ${dis.invNumber} - ${dis.status} - ${dis.model}` }).join(",  "),
                parts: facility.parts.map((part, index) => { return `${part.productName}:  ${part.quantity}${part.unit}` }).join(",  ")
            });
        });

        //Downloading File
        // res.setHeader(
        //     "Content-Type",
        //     "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        // );
        // res.setHeader(
        //     "Content-Disposition",
        //     "attachment;filename=" + "objekti.xlsx"
        // );

        // workbook.xlsx.write(res);

        workbook.xlsx.writeBuffer().then(buffer => {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "tipicnikola@gmail.com",
                    pass: "hvpxntrcjojmwwpj"
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mail_configs = {
                from: "tipicnikola@gmail.com",
                to: "tipic.n@outlook.com",
                subject: "Izvoz Objekata",
                attachments: [{
                    filename: "Izvoz_Objekata.xlsx",
                    content: buffer
                }]
            };

            transporter.sendMail(mail_configs, (err, info) => {
                if (err) {
                    res.json({
                        status: "FAILED",
                        message: "Error mail nije poslan!",
                        data: err
                    });

                    return;
                }

                res.json({
                    status: "SUCCESS",
                    message: "Objekti su uspiješno izvezeni na email",
                    data: info
                });
            })
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to write buffer!",
                data: err
            });
        })

    }).catch(err => {
        res.json({
            status: "FAILED",
            message: "An error occured while trying to get Facilities from the database!",
            data: err
        });
    })
});


router.get("/exportFacilityReportXlsx", (req, res) => {
    Facility.find({ "dispensers.status": "active" }).then(result => {
        let workbook = new excelJs.Workbook();

        const sheet = workbook.addWorksheet("objekti_izvijesce");
        sheet.columns = [
            { header: "ID Objekta", key: "id", width: 25 },
            { header: "Naziv Objekta", key: "name", width: 25 },
            { header: "Adresa", key: "address", width: 25 },
            { header: "Naziv mjesta", key: "city", width: 25 },
            { header: "Točionici", key: "dispensers", width: 75 }
        ];



        result.map((facility, index) => {
            sheet.addRow({
                id: facility.id,
                name: facility.name,
                address: facility.location.address,
                city: facility.location.city,
                dispensers: facility.dispensers
                    .filter((dis) => { return dis.status === "active" })
                    .map((dis, index) => `Točionik ${index + 1}:  ${dis.invNumber} - ${dis.status} - ${dis.model}`)
                    .join(",  ")
            });
        });

        workbook.xlsx.writeBuffer().then(buffer => {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "tipicnikola@gmail.com",
                    pass: "hvpxntrcjojmwwpj"
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mail_configs = {
                from: "tipicnikola@gmail.com",
                to: "tipic.n@outlook.com",
                subject: "Izvoz Objekata, izviješće pivovara",
                attachments: [{
                    filename: "Izvoz_Objekata_izviješće_pivovara.xlsx",
                    content: buffer
                }]
            };

            transporter.sendMail(mail_configs, (err, info) => {
                if (err) {
                    res.json({
                        status: "FAILED",
                        message: "Error mail nije poslan!",
                        data: err
                    });

                    return;
                }

                res.json({
                    status: "SUCCESS",
                    message: "Izviješće Objekata za pivovaru je uspiješno izvezeno i poslano na email",
                    data: info
                });
            })
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to write buffer!",
                data: err
            });
        })

    }).catch(err => {
        res.json({
            status: "FAILED",
            message: "An error occured while trying to get Facilities from the database!",
            data: err
        });
    })
});



router.get("/exportDispensersCentralXlsx", (req, res) => {
    Dispenser.find({}).then(result => {
        let workbook = new excelJs.Workbook();

        const sheet = workbook.addWorksheet("tocionici_centralno");
        sheet.columns = [
            { header: "Inventurni broj", key: "invNumber", width: 25 },
            { header: "Ser. broj", key: "serialNum", width: 25 },
            { header: "Model", key: "model", width: 25 },
            { header: "Status", key: "status", width: 25 }
        ];



        result.map((row) => {
            sheet.addRow(row);
        });

        workbook.xlsx.writeBuffer().then(buffer => {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "tipicnikola@gmail.com",
                    pass: "hvpxntrcjojmwwpj"
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mail_configs = {
                from: "tipicnikola@gmail.com",
                to: "tipic.n@outlook.com",
                subject: "Izvoz točionika s centralnog skladišta",
                attachments: [{
                    filename: "Izvoz_Tocionika_Centralno.xlsx",
                    content: buffer
                }]
            };

            transporter.sendMail(mail_configs, (err, info) => {
                if (err) {
                    res.json({
                        status: "FAILED",
                        message: "Error mail nije poslan!",
                        data: err
                    });

                    return;
                }

                res.json({
                    status: "SUCCESS",
                    message: "Točionici su uspiješno izvezeni na email",
                    data: info
                });
            })
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to write buffer!",
                data: err
            });
        })

    }).catch(err => {
        res.json({
            status: "FAILED",
            message: "An error occured while trying to get Dispensers from the database!",
            data: err
        });
    })
});



router.get("/exportDispensersExpenseXlsx", (req, res) => {
    DispenserExpense.find({}).then(result => {
        let workbook = new excelJs.Workbook();

        const sheet = workbook.addWorksheet("tocionici_rashod");
        sheet.columns = [
            { header: "Inventurni broj", key: "invNumber", width: 25 },
            { header: "Ser. broj", key: "serialNum", width: 25 },
            { header: "Model", key: "model", width: 25 },
            { header: "Status", key: "status", width: 25 }
        ];



        result.map((row) => {
            sheet.addRow(row);
        });

        workbook.xlsx.writeBuffer().then(buffer => {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "tipicnikola@gmail.com",
                    pass: "hvpxntrcjojmwwpj"
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mail_configs = {
                from: "tipicnikola@gmail.com",
                to: "tipic.n@outlook.com",
                subject: "Izvoz točionika s skladišta rashoda",
                attachments: [{
                    filename: "Izvoz_Tocionika_Rashod.xlsx",
                    content: buffer
                }]
            };

            transporter.sendMail(mail_configs, (err, info) => {
                if (err) {
                    res.json({
                        status: "FAILED",
                        message: "Error mail nije poslan!",
                        data: err
                    });

                    return;
                }

                res.json({
                    status: "SUCCESS",
                    message: "Točionici su uspiješno izvezeni na email",
                    data: info
                });
            })
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to write buffer!",
                data: err
            });
        })

    }).catch(err => {
        res.json({
            status: "FAILED",
            message: "An error occured while trying to get Dispensers from the database!",
            data: err
        });
    })
});



router.get("/exportPartsXlsx", (req, res) => {
    Part.find({ quantity: { $gt: 0 } }).then(result => {
        let workbook = new excelJs.Workbook();

        const sheet = workbook.addWorksheet("djelovi_centralno");
        sheet.columns = [
            { header: "Ime proizvoda", key: "productName", width: 25 },
            { header: "Šifra proizvoda", key: "productCode", width: 25 },
            { header: "Kolićina", key: "quantity", width: 25 },
            { header: "Mijerna jedinica", key: "quantityUnit", width: 25 }
        ];



        result.map((row) => {
            sheet.addRow(row);
        });

        workbook.xlsx.writeBuffer().then(buffer => {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "tipicnikola@gmail.com",
                    pass: "hvpxntrcjojmwwpj"
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mail_configs = {
                from: "tipicnikola@gmail.com",
                to: "tipic.n@outlook.com",
                subject: "Izvoz djelova s centralnog skladišta",
                attachments: [{
                    filename: "Izvoz_Djelova_Centralno.xlsx",
                    content: buffer
                }]
            };

            transporter.sendMail(mail_configs, (err, info) => {
                if (err) {
                    res.json({
                        status: "FAILED",
                        message: "Error mail nije poslan!",
                        data: err
                    });

                    return;
                }

                res.json({
                    status: "SUCCESS",
                    message: "Djelovi su uspiješno izvezeni na email",
                    data: info
                });
            })
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to write buffer!",
                data: err
            });
        })

    }).catch(err => {
        res.json({
            status: "FAILED",
            message: "An error occured while trying to get Dispensers from the database!",
            data: err
        });
    })
});



router.get("/exportPartsExpenseXlsx", (req, res) => {
    Expense.find({ quantity: { $gt: 0 } }).then(result => {
        let workbook = new excelJs.Workbook();

        const sheet = workbook.addWorksheet("djelovi_rashod");
        sheet.columns = [
            { header: "Ime proizvoda", key: "productName", width: 25 },
            { header: "Šifra proizvoda", key: "productCode", width: 25 },
            { header: "Kolićina", key: "quantity", width: 25 },
            { header: "Mijerna jedinica", key: "quantityUnit", width: 25 }
        ];



        result.map((row) => {
            sheet.addRow(row);
        });

        workbook.xlsx.writeBuffer().then(buffer => {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: {
                    user: "tipicnikola@gmail.com",
                    pass: "hvpxntrcjojmwwpj"
                },
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mail_configs = {
                from: "tipicnikola@gmail.com",
                to: "tipic.n@outlook.com",
                subject: "Izvoz djelova s skladišta rashoda",
                attachments: [{
                    filename: "Izvoz_Djelova_Rashod.xlsx",
                    content: buffer
                }]
            };

            transporter.sendMail(mail_configs, (err, info) => {
                if (err) {
                    res.json({
                        status: "FAILED",
                        message: "Error mail nije poslan!",
                        data: err
                    });

                    return;
                }

                res.json({
                    status: "SUCCESS",
                    message: "Djelovi su uspiješno izvezeni na email",
                    data: info
                });
            })
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to write buffer!",
                data: err
            });
        })

    }).catch(err => {
        res.json({
            status: "FAILED",
            message: "An error occured while trying to get Dispensers from the database!",
            data: err
        });
    })
});


module.exports = router;