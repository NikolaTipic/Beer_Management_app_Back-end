const express = require("express");
const router = express.Router();
//excelJS
const excelJs = require("exceljs");
//nodemailer
const nodemailer = require("nodemailer");
//mongo model
const Facility = require("../models/Facility");



router.get("/exportFacilityXlsx", (req, res) => {
    Facility.find({}).then( result => {
        let workbook = new excelJs.Workbook();

        const sheet = workbook.addWorksheet("objekti");
        sheet.columns = [
            { header: "ID Objekta", key: "id", width: 25 },
            { header: "Ime Objekta", key: "name", width: 25 },
            { header: "Naziv mjesta", key: "city", width: 25 },
            { header: "Adresa", key: "address", width: 25 },
            { header: "Točionici", key: "dispensers", width: 75 },
            { header: "Djelovi", key: "parts", width: 50 }
        ];



        result.map((facility, index) => {
            sheet.addRow({
                id: facility.id,
                name: facility.name,
                city: facility.location.city,
                address: facility.location.address,
                dispensers: facility.dispensers.map((dis, index) => { return `Točionik ${index+1}:  ${dis.invNumber} - ${dis.status} - ${dis.model}`}),
                parts: facility.parts.map((part, index) => {return `${part.productName}: ${part.quantity}${part.unit}`})
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
                        message: "Error sending mail",
                        data: err
                    });

                    return;
                }

                res.json({
                    status: "SUCCESS",
                    message: "Mail uspiješno poslan",
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


module.exports = router;