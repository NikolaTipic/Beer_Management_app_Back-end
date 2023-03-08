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
                    message: `Uspijesno ste dodali: ${result[0].productName} +${quantity} ${result[0].quantityUnit}`
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
                message: "Serviseri su uspiješno dohvaćeni",
                data: result
            });
        }
        else {
            res.json({
                status: "FAILED",
                message: "Nema dodanih Servisera u bazi podataka!"
            })
        }
    }).catch(err => {
        console.log(err);
        res.json({
            status: "FAILED",
            message: "An error occured while retreving servicer inventory list!"
        })
    })
});


//getExpenseInventory
router.post("/getExpenseInventory", (req, res) => {

    Expense.find({}).then(result => {
        if (result.length) {
            res.json({
                status: "SUCCESS",
                message: "Skladište Rashoda je uspiješno dohvaćeno",
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
            message: "An error occured while retreving expense inventory list!"
        })
    })
});


//deleteExpenseInventory
router.post("/deleteExpenseInventory", (req, res) => {

    Expense.deleteMany({}).then(result => {
        res.json({
            status: "SUCCESS",
            message: "Skladište Rashoda je uspiješno Obrisano",
            data: result
        })
    }).catch(err => {
        console.log(err);
        res.json({
            status: "FAILED",
            message: "An error occured while Deleteing expense inventory list!"
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
            if (resultpart.length) {
                if (resultpart[0].quantity >= quantity) {
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
                } else {
                    res.json({
                        status: "FAILED",
                        message: `Nemate dovolju kolicinu ${resultpart[0].productName} da bi dodali u rashod`
                    });
                }
            }

            //handling errors
            else {
                res.json({
                    status: "FAILED",
                    message: "Proizvod pod unesenom šifrom ne postoji na vašem centralnom skladištu!"
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
            if (resultpart.length) {
                if (resultpart[0].quantity >= quantity) {
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
                } else {
                    res.json({
                        status: "FAILED",
                        message: `Nemate dovolju kolicinu ${resultpart[0].productName} da bi zadužili servisera`
                    });
                }
            }

            //handling errors
            else {
                res.json({
                    status: "FAILED",
                    message: "Proizvod pod unesenom šifrom ne postoji na vašem centralnom skladištu!"
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


//fromServicerToCentral
router.post("/fromServicerToCentral", (req, res) => {
    let { name, productCode, quantity } = req.body;

    if (productCode == "" || quantity == "" || name == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        });
    } else {
        //checking if servicer exist
        Servicer.find({ name }).then(resultName => {
            if (resultName.length) {
                Servicer.find({ name, "parts.productCode": productCode }).then(resultpart => {
                    if (resultpart.length) {
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
                                        Part.updateOne({ productCode }, { $inc: { quantity: quantity } }, { new: true }, (error, data) => {
                                            if (error) {
                                                res.json({
                                                    status: "FAILED",
                                                    message: `Error has occured while trying to add part to Central inventory from Sericer ${name} , check your internet connection`
                                                });
                                            }
                                            else {
                                                res.json({
                                                    status: "SUCCESS",
                                                    message: `Razdužili ste Servisera: ${name}, i dodali u centralno skladište: ${result[0].parts[0].productName} +${quantity}`
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
                        })
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
        })
    }
});


//fromServicerToExpense
router.post("/fromServicerToExpense", (req, res) => {
    let { name, productCode, quantity } = req.body;

    if (productCode == "" || quantity == "" || name == "") {
        res.json({
            status: "FAILED",
            message: "Morate ispuniti sva polja!"
        });
    } else {
        //checking if servicer exist
        Servicer.find({ name }).then(resultName => {
            if (resultName.length) {
                Servicer.find({ name, "parts.productCode": productCode }).then(resultpart => {
                    if (resultpart.length) {
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
                                        Expense.find({productCode}).then(expenseResult => {
                                            if(expenseResult.length) {
                                                Expense.updateOne({ productCode }, { $inc: { quantity: quantity } }, { new: true }, (error, data) => {
                                                    if (error) {
                                                        res.json({
                                                            status: "FAILED",
                                                            message: `Error has occured while trying to add part to Expense inventory from Servicer ${name} , check your internet connection`
                                                        });
                                                    }
                                                    else {
                                                        res.json({
                                                            status: "SUCCESS",
                                                            message: `Razdužili ste Servisera: ${name}, i dodali u skladište Rashoda: ${result[0].parts[0].productName} +${quantity}`
                                                        });
                                                    }
                                                });
                                            } else {
                                                newExpensePart = new Expense({
                                                    productName: result[0].parts[0].productName,
                                                    productCode,
                                                    quantity,
                                                    quantityUnit: result[0].parts[0].unit
                                                })
                    
                                                newExpensePart.save().then(resultNewExpense => {
                                                    res.json({
                                                        status: "SUCCESS",
                                                        message: `Razdužili ste servisera: ${name}, te uspiješno dodali novi prizvod u rashod: ${result[0].parts[0].productName} +${quantity}${result[0].parts[0].unit}`,
                                                        data: resultNewExpense
                                                    })
                    
                                                })
                                                    .catch(err => {
                                                        res.json({
                                                            status: "FAILED",
                                                            message: "An error occurred while creating new product to expense!"
                                                        })
                                                    })
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
                        })
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
        })
    }
});


module.exports = router;