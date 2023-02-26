const express = require("express");
const router = express.Router();

//mongo db Part model
const Part = require("../models/Parts");
//mongo sb Servicer model
const Servicer = require("../models/Servicer");

//addPart
router.post("/addPart", (req, res) => {
    let {quantityUnit, productName, productCode, quantity} = req.body;


    

    if(productName == "" || productCode == "" || quantity == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        })
    } else {
        //checking if part already exist
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
                    message: `Uspijesno ste dodali: ${productName} + ${quantity}`
                })
            }

        //if part do not exist, create New
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
                        message: `Uspiješno ste dodali novi prizvod: ${productName} + ${quantity}`,
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
});



//removePart
router.post("/removePart", (req, res) => {
    let { productName, productCode, quantity} = req.body;


    

    if(productName == "" || productCode == "" || quantity == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva obavezna polja!"
        })
    } else {
        //checking if part already exist
        Part.find({productCode}).then(result =>{
            if (result.length) {
                
                Part.updateOne({productCode}, {$inc: {quantity: -quantity}}, {new: true}, (error, data) => {
                    if(error) {
                        console.log(error);
                    }
                    else {
                        console.log(data);
                    }
                });

                res.json({
                    status: "SUCCESS",
                    message: `Uspijesno ste oduzeli: ${quantity} - ${productName}`
                })
            }

        //if part do not exist, create New
            else {
                res.json({
                    status: "FAILED",
                    message: "Unos šifre ne odgovara nijednom proizvodu u skladištu!"
                })
            }
        }). catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find product! "
            })
        })
    }
});


//getInventory
router.post("/getInventory", (req, res) => {

    Part.find({}).then( result => {
        if (result.length) {
            res.json({
                status: "SUCCESS",
                message: "Skladište je uspiješno dohvaćeno",
                data: result
            });
        }
        else {
            res.json({
                status: "FAILED",
                message: "Skladište je prazno"
            })
        }
    }).catch(err => {
        console.log(err);
        res.json({
            status: "FAILED",
            message: "An error occured while retreving inventory list!"
        })
    })
})


//addToServicer
router.post("/addToServicer", (req, res) => {
    let {quantityUnit, productName, productCode, quantity, servName} = req.body;


    

    if(productName == "" || productCode == "" || quantity == "" || servName == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        })
    } else {
        //checking if part exist
        Part.find({productCode}).then(result =>{
            if (result.length) {
                //napravit ime proizvoda, ono koje vraca iz baze, da korisnik unosi samo sifru bez imena proizvoda
                //console.log(result)
                Servicer.find({productCode, servName}).then(result => {
                    if (result.length) {
                        Servicer.updateOne({productCode}, {$inc: {quantity: quantity}}, {new: true}, (error, data) => {
                            if(error) {
                                console.log(error);
                            }
                            else {
                                console.log(data);
                            }
                        });

                        res.json({
                            status: "SUCCESS",
                            message: `Uspiješno ste dodali - ${servName}: ${quantity} + ${productName}`
                        });

                        Part.updateOne({productCode}, {$inc: {quantity: -quantity}}, {new: true}, (error, data) => {
                            if(error) {
                                console.log(error);
                            }
                            else {
                                console.log(data);
                            }
                        });

                    } else {
                        newServicerPart = new Servicer({
                            productName,
                            productCode,
                            servName,
                            quantity,
                            quantityUnit
                        })
                    
                        newServicerPart.save().then(result => {
                            res.json({
                                status: "SUCCESS",
                                message: `Uspiješno ste dodali novi prizvod ${servName}: ${productName} + ${quantity}`,
                                data: result,
                            })
                        
                        })
                        .catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occurred while adding product to servicer!"
                            })
                        })

                        Part.updateOne({productCode}, {$inc: {quantity: -quantity}}, {new: true}, (error, data) => {
                            if(error) {
                                console.log(error);
                            }
                            else {
                                console.log(data);
                            }
                        });
                    }
                }) 
            }

        //handling errors
            else {
                res.json({
                    status: "FAILED",
                    message: "Proizvod pod unesenom šifrom ne postoji na vašem skladištu"
                });
            }
        }). catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find product! "
            })
        })
    }
});




module.exports = router;