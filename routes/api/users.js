const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const Users = require('../../models/Users');
const gravater = require('gravatar');
const bcrypt = require('bcryptjs');


//router.get('/', (req, res) => res.send('User route'));

//Post route
router.post('/', [
    // validation
    check('name', 'Name required').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
    check('password', 'Please follow password requirments').isLength({min:6})
], 

async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){ // error check
        return res.status(400).json({errors : errors.array()}); // error msg return if exists
    }

    const {name, email, password} = req.body; // extracting info into constant for later use

    try {
        // see if user exists

        let user = await Users.findOne({email});
        if(user){
             res.status(400).json({errors: [{msg: "This email has already an account"}]});
        }

        // Get user gravatar

        const avatar = gravater.url(email, { // gravater returns an url associated with email
            s: '200', // size
            r: 'pg' , // rating
            d: 'mm'  //default image

        })

        // create a user instance with all the info: name, avatar, pass, email

        user = new Users({
            name,
            email,
            password,
            avatar
        });

        // Encrypt Password using bcrypt

        const salt = await bcrypt.genSalt(10);// create salt
        user.password = await bcrypt.hash(password, salt); // password hashing with salt

        //Save user to the database
        await user.save();

        // return jwt for logged in

        res.send('User Registered');
        
    } 
    catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");

    }

});



module.exports = router;