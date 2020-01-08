const express = require('express');
const router = express.Router();
const {check, validationResult} = require('express-validator');
const Users = require('../../models/Users');


//router.get('/', (req, res) => res.send('User route'));

//Post route
router.post('/', [
    // validation
    check('name', 'Name required').not().isEmpty(),
    check('email', 'Invalid email').isEmail(),
    check('password', 'Please follow password requirments').isLength({min:6})
], 

(req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){ // error check
        return res.status(400).json({errors : errors.array()}); // error msg return if exists
    }

    // see if user exists

    // Get user gravatar

    // Encrypt Password using bcrypt

    // return jwt for logged in

 res.send('User route');
});



module.exports = router;