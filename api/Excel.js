const express = require("express");
const router = express.Router();
//excelJS
const excelJs = require("exceljs");

const Facility = require("../models/Facility");


router.get("/exportFacilityXlsx", (req, res) => {
    Facility.find({}).then(async result => {
        let workbook = new excelJs.Workbook();

        const sheet = workbook.addWorksheet("objekti");
        sheet.columns = [
            { header: "Ime Objekta", key: "name", width: 25 },
            { header: "ID Objekta", key: "id", width: 25 },
            { header: "Naziv mjesta", key: "city", width: 25 },
            { header: "Adresa", key: "address", width: 25 },
            { header: "Točionici", key: "dispensers", width: 75 }
        ];



        await result.map((facility, index) => {
            sheet.addRow({
                name: facility.name,
                id: facility.id,
                city: facility.location.city,
                address: facility.location.address,
                dispensers: facility.dispensers.map(dis => { return dis.invNumber})
            });
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment;filename" + "objekti.xlsx"
        );

        workbook.xlsx.write(res);

    }).catch(err => {
        res.json({
            status: "FAILED",
            data: err
        });
    })
});


module.exports = router;