// This profile route will have different api request
// like a get request for the current user proifile(e.g. private based on current token) or all user profile

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/Users');

// Private get request for current user profile
router.get('/currentuser', auth, async (req, res) => { // '/currentuser' defines the endpoint (in the URL) of the request for the current user 
    try {
        const profile = await Profile.findOne({user: req.user.id}) // altough we want current user profile; but we haveto getit by user id; that's why we associated user model in profile model 
        .populate('user', ['name', 'avatar']); // we also want to bring the name and avatar(e.g. 2nd parameter) from user (1st parameter) model

        //Check if the user profile exists
        if (!profile){
            return res.status(400).json({msg:'No profile found'});
        }

        // return profile
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error for Current user-profile request')
    }
});

module.exports = router;