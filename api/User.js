const express = require("express");
const router = express.Router();

//mongo db user model
const User = require("./../models/User")
//Password handler
const bcryptjs = require("bcryptjs");
const e = require("cors");

//login
router.post("/login", (req, res) => {
    let {email, password} = req.body;
    email = email.trim();
    email = email.toLowerCase();
    password = password.trim();

    if(email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Sva polja morate ispuniti!"
        });
    } else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)){
        res.json({
            status: "FAILED",
            message: "Email nije ispravno unesen!"
        })
    }
    
    else {
        //check if user exist
        User.findOne({email}).then(data => {
            if(data !== null) {
                //user exist
                const hasshedPassword = data.password;
                
                bcryptjs.compare(password, hasshedPassword)
                .then(result => {
                    if(result) {
                        res.json({
                            status: "SUCCESS",
                            message: "Sign in successfull!",
                            data: data
                        })
                    } else {
                        res.json({
                            status: "FAILED",
                            message: "Uneseni podatci nisu ispravni!"
                        })
                    }
                })
                .catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occured while checking password!"
                    })
                })
            } else {
                res.json({
                    status: "FAILED",
                    message: "Uneseni podatci nisu ispravni!"
                })
            }
        }).catch(err => {
            res.json({
                status: "FAILED",
                message: "An error occured while checking for an existing user!"
            })
        })
    }
    
});


//signup
router.post("/signup", (req, res) => {
    let {name, email, password, code, administrator} = req.body;
    name = name.trim();
    email = email.trim();
    email = email.toLowerCase();
    password = password.trim();
    

    if(name == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Sva polja morate ispuniti!"
        });
    } else if(!/^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð ,.'-]+$/.test(name)) {
        res.json({
            status: "FAILED",
            message: "Ime nije ispravno uneseno"
        })
    } else if(!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Email nije ispravno unesen!"
        })
    } else if(password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Lozinka je pre kratka!"
        })
    } else {
        if(administrator) {
            if(code !== "id1950"){
                res.json({
                    status: "FAILED",
                    message: "Krivi kod unesen!"
                }) 
            }
            else {
                //checking if user already exist
                User.find({email}).then(result =>{
                if (result.length) {
                    res.json({
                        status: "FAILED",
                        message: "Korisnik s unesnim email-om vec postoji!"
                    })
                } else {
                        //Try to create new User
    
                        //password handeling
                        const saltRounds = 10;
                        bcryptjs.hash(password, saltRounds).then(hashedPassword => {
                            const newUser = new User({
                                name,
                                email,
                                password: hashedPassword,
                                administrator
                            });
    
                            newUser.save().then(result => {
                                res.json({
                                    status: "SUCCESS",
                                    message: "Signup successful",
                                    data: result,
                                })
                            })
                            .catch(err => {
                                res.json({
                                    status: "FAILED",
                                    message: "An error occurred while saving user account"
                                })
                            })
    
                        })
                        .catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occured while hashing password!"
                            })
                        })
                    }
                }).catch(err => {
                    console.log(err);
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while checking for an existing user!"
                    })
                })
            }
        } else {
            //checking if user already exist
            User.find({email}).then(result =>{
            if (result.length) {
                res.json({
                    status: "FAILED",
                    message: "Korisnik s unesnim email-om vec postoji!"
                })
            } else {
                    //Try to create new User

                    //password handeling
                    const saltRounds = 10;
                    bcryptjs.hash(password, saltRounds).then(hashedPassword => {
                        const newUser = new User({
                            name,
                            email,
                            password: hashedPassword,
                            administrator
                        });

                        newUser.save().then(result => {
                            res.json({
                                status: "SUCCESS",
                                message: "Signup successful",
                                data: result,
                            })
                        })
                        .catch(err => {
                            res.json({
                                status: "FAILED",
                                message: "An error occurred while saving user account"
                            })
                        })

                    })
                    .catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occured while hashing password!"
                        })
                    })
                }
            }).catch(err => {
                console.log(err);
                res.json({
                    status: "FAILED",
                    message: "An error occurred while checking for an existing user!"
                })
            })
        }
        
    }
});

 module.exports = router;