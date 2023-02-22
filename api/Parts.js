const express = require("express");
const router = express.Router();

//mongo db Part model
const Part = require("../models/Parts");

//addPart
router.post("/addPart", (req, res) => {
    let {quantityUnit, productName, productCode, quantity} = req.body;


    

    if(productName == "" || productCode == "" || quantity == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        })
    } else {
        //checking if dispenser already exist
        Part.find({productCode}).then(result =>{
            if (result.length) {
                
                Part.updateOne({productCode}, {$inc: {quantity: quantity}}, {new: true}, (error, data) => {
                    if(error) {
                        console.log(error);
                    }
                    else {
                        console.log(data);
                    }
                });

                res.json({
                    status: "SUCCESS",
                    message: `Uspijesno ste dodali: ${quantity} - ${productName}`
                })
            }
            else {
                newPart = new Part({
                    productName,
                    productCode,
                    quantity,
                    quantityUnit
                })
            
                newPart.save().then(result => {
                    res.json({
                        status: "SUCCESS",
                        message: `Uspiješno ste dodali novi prizvod: ${productName} - ${quantity}`,
                        data: result,
                    })
                
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while adding product!"
                    })
                })
            }
        }). catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find product! "
            })
        })
    }
})



module.exports = router;