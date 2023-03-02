const express = require("express");
const router = express.Router();

//mongo db Part model
const Part = require("../models/Parts");
//mongo db Servicer model
const Servicer = require("../models/Servicer");
//mogo db Expense model
const Expense = require("../models/Expense");


//addPart
router.post("/addPart", (req, res) => {
    let { quantityUnit, productName, productCode, quantity } = req.body;




    if (productName == "" || productCode == "" || quantity == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        })
    } else {
        //checking if part already exist
        Part.find({ productCode }).then(result => {
            if (result.length) {

                Part.updateOne({ productCode }, { $inc: { quantity: quantity } }, { new: true }, (error, data) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log(data);
                    }
                });

                res.json({
                    status: "SUCCESS",
                    message: `Uspijesno ste dodali: ${productName} +${quantity} ${quantityUnit}`
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
                        message: `Uspiješno ste dodali novi prizvod: ${productName} +${quantity} ${quantityUnit}`,
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
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find product! "
            })
        })
    }
});



//removePart
router.post("/removePart", (req, res) => {
    let { productName, productCode, quantity } = req.body;




    if (productName == "" || productCode == "" || quantity == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva obavezna polja!"
        })
    } else {
        //checking if part already exist
        Part.find({ productCode }).then(result => {
            if (result.length) {

                Part.updateOne({ productCode }, { $inc: { quantity: -quantity } }, { new: true }, (error, data) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log(data);
                    }
                });

                res.json({
                    status: "SUCCESS",
                    message: `Uspijesno ste oduzeli: ${quantity} -${productName}`
                })
            }

            //if part do not exist, create New
            else {
                res.json({
                    status: "FAILED",
                    message: "Unos šifre ne odgovara nijednom proizvodu u skladištu!"
                })
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find product! "
            })
        })
    }
});


//getInventory
router.post("/getInventory", (req, res) => {

    Part.find({}).then(result => {
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


//getServicerInventory
router.post("/getServicerInventory", (req, res) => {

    Servicer.find({}).then(result => {
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
});


//addToExpense
router.post("/addToExpense", (req, res) => {
    let { productCode, quantity } = req.body;

    if (productCode == "" || quantity == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        })
    } else {
        //checking if part exist
        Part.find({ productCode }).then(resultpart => {
            if (resultpart.length & resultpart[0].quantity > 0) {
                // [
                //     {
                //       _id: new ObjectId("63fb5110003df1bdec49bd85"),
                //       productName: 'Kegglava',
                //       productCode: 1111,
                //       quantity: 0,
                //       quantityUnit: '',
                //       __v: 0
                //     }
                //   ]

                Expense.find({ productCode }).then(result => {
                    if (result.length) {
                        Expense.updateOne({ productCode }, { $inc: { quantity: quantity } }, { new: true }, (error, data) => {
                            if (error) {
                                console.log(error);
                            }
                            else {
                                console.log(data);
                            }
                        });

                        res.json({
                            status: "SUCCESS",
                            message: `Uspiješno ste dodali u rashod: ${result[0].productName} +${quantity}${result[0].quantityUnit}`
                        });

                        Part.updateOne({ productCode }, { $inc: { quantity: -quantity } }, { new: true }, (error, data) => {
                            if (error) {
                                console.log(error);
                            }
                            else {
                                console.log(data);
                            }
                        });

                    } else {
                        newExpensePart = new Expense({
                            productName: resultpart[0].productName,
                            productCode,
                            quantity,
                            quantityUnit: resultpart[0].quantityUnit
                        })

                        newExpensePart.save().then(result => {
                            res.json({
                                status: "SUCCESS",
                                message: `Uspiješno ste dodali novi prizvod u rashod: ${resultpart[0].productName} +${quantity}${resultpart[0].quantityUnit}`,
                                data: result
                            })

                        })
                            .catch(err => {
                                res.json({
                                    status: "FAILED",
                                    message: "An error occurred while adding product to expense!"
                                })
                            })

                        Part.updateOne({ productCode }, { $inc: { quantity: -quantity } }, { new: true }, (error, data) => {
                            if (error) {
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
                    message: "Proizvod pod unesenom šifrom ne postoji na vašem centralnom skladištu ILI ste ga potrošili"
                });
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find product! "
            })
        })
    }
});




//addToServicer
router.post("/addToServicer", (req, res) => {
    let { name, productCode, quantity } = req.body;

    if (productCode == "" || quantity == "" || name == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        })
    } else {
        //checking if part exist
        Part.find({ productCode }).then(resultpart => {
            if (resultpart.length & resultpart[0].quantity > 0) {

                Servicer.find({ name }).then(resultName => {
                    if (resultName.length) {
                        Servicer.find({ name, "parts.productCode": productCode }).then(result => {
                            if (result.length) {
                                Servicer.updateOne({ name, "parts.productCode": productCode }, { $inc: { "parts.$.quantity": quantity } }, { new: true }, (error, data) => {
                                    if (error) {
                                        console.log(error);
                                    }
                                    else {
                                        console.log(data);
                                    }
                                });

                                res.json({
                                    status: "SUCCESS",
                                    message: `Uspiješno ste dodali - ${name}: ${resultpart[0].productName} +${quantity} ${resultpart[0].quantityUnit}`
                                });

                                Part.updateOne({ productCode }, { $inc: { quantity: -quantity } }, { new: true }, (error, data) => {
                                    if (error) {
                                        console.log(error);
                                    }
                                    else {
                                        console.log(data);
                                    }
                                });

                            } else {
                                Servicer.updateOne({ name }, { $push: { parts: { productName: resultpart[0].productName, productCode, quantity, unit: resultpart[0].quantityUnit } } }, (error, data) => {
                                    if (error) {
                                        console.log(error);
                                    }
                                    else {
                                        console.log(data);
                                    }
                                });

                                res.json({
                                    status: "SUCCESS",
                                    message: `Uspiješno ste dodali novi proizvod: ${resultpart[0].productName} +${quantity} ${resultpart[0].quantityUnit} - ${name}`
                                });

                                Part.updateOne({ productCode }, { $inc: { quantity: -quantity } }, { new: true }, (error, data) => {
                                    if (error) {
                                        console.log(error);
                                    }
                                    else {
                                        console.log(data);
                                    }
                                });
                            }
                        })

                    } else {
                        newServicer = new Servicer({
                            name,
                            parts: {
                                productName: resultpart[0].productName,
                                productCode,
                                quantity,
                                unit: resultpart[0].quantityUnit
                            }
                        })

                        newServicer.save().then(result => {
                            res.json({
                                status: "SUCCESS",
                                message: `Uspiješno ste dodali novog Servisera: ${name}, i proizvod: ${resultpart[0].productName} +${quantity} ${resultpart[0].quantityUnit}`,
                                data: result,
                            })

                        })
                            .catch(err => {
                                res.json({
                                    status: "FAILED",
                                    message: "An error occurred while creating new servicer!"
                                })
                            })

                        Part.updateOne({ productCode }, { $inc: { quantity: -quantity } }, { new: true }, (error, data) => {
                            if (error) {
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
                    message: "Proizvod pod unesenom šifrom ne postoji na vašem centralnom skladištu ILI ste ga potrošili!"
                });
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while trying to find product! "
            })
        })
    }
});



module.exports = router;