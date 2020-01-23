const express = require('express');
const router = express.Router();
const auth = require ('../../middleware/auth');
const User = require('../../models/Users');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrpt = require('bcryptjs');
const {check, validationResult} = require('express-validator');


//Get route
// Return User data(user name, avatar...) using auth middleware
router.get('/', auth, async (req, res) => {
    try {
       const user = await User.findById(req.user.id).select('-password') // Since its a protected route(e.g. need authentication token), we can use req.user.id from middleware in findById(); select('-password') basically remode the password from data.
       res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error for token request during registration');
    }
});



// Public Post route to authenticate user and to get token


router.post('/', [
    // Data validation
    check('email', 'Invalid email').isEmail(),
    check('password', 'Incorrect Password').exists()
    ],

    async (req, res) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){ // error check
            return res.status(400).json({errors : errors.array()}); // error msg return if exists
        }

        const {email, password} = req.body; // extracting info into constant for later use

        try {
            // see if user exists in the database; if not exists- error

            let user = await User.findOne({email});
            if(!user){
                return res.status(400).json({errors: [{msg: "Email not exists in the system!!!"}]});
            }

            // Check if user email and password credintials are okay!

            const passMatch = await bcrpt.compare(password, user.password); // compare() function in bcrypt matches a plain-txt pass with an encrypted pass: password => plain pass; user.password => encrypted pass in the syatem

            if (!passMatch){
                return res.status(400).json({errors: [{msg: "Invalid password!!!"}]});
            }

            
            // return jwt for logged in
            const payload = {
                user: {
                    id: user.id
                }
            }

            jwt.sign(payload, config.get('JwtToken'), 
            { expiresIn : 36000 },
            (err, token) => {
                if (err) throw err;
                res.json({token});
            }
            )
            
        } 
        catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error for Login");

        }
    }    
);

module.exports = router;