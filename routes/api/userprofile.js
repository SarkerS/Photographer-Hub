// This profile route will have multiple different api request
// like a get request for the current user proifile(e.g. private based on current token) or all user profile

const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/Users');
const {check, validationResult} = require('express-validator/check');


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


// Private POST request to create or update user profile

router.post('/', [auth, //using middleware
                //Checking for the error
                 [check('role', 'What is your role?').not().isEmpty(),
                  check ('skills', 'Skills are required.').not().isEmpty()]],
                  async (req, res)=> {
                      const errors = validationResult(req);
                      if(!errors.isEmpty()){
                          return res.status(400).json({errors: errors.array()});
                      }
                      
                      //Building a profile object  
                      const {
                        organization,
                        website,
                        location,
                        bio,
                        role,
                        flickerusername,
                        skills,
                        youtube,
                        facebook,
                        twitter,
                        instagram,
                        linkedin
                      } = req.body;

                      //Build profile object
                      const profileFields = {};
                      profileFields.user = req.user.id;
                      if (organization)profileFields.organization = organization ;
                      if (website)profileFields.website = website;
                      if (location)profileFields.location = location;
                      if (bio)profileFields.bio = bio;
                      if (role)profileFields.role = role;
                      if (flickerusername)profileFields.flickerusername = flickerusername;
                      if (skills){
                          profileFields.skills = skills.split(',').map(skill => skill.trim()); // Put every skill in an array index; split on ','; and for removing space used trim()
                        }
                     // Build social object

                     profileFields.social = {}
                     if (youtube) profileFields.social.youtube = youtube;
                     if (facebook) profileFields.social.facebook = facebook;
                     if (twitter) profileFields.social.twitter = twitter;
                     if (instagram) profileFields.social.instagram = instagram;
                     if (linkedin) profileFields.social.linkedin = linkedin;

                     try {
                         let profile = await Profile.findOne({user : req.user.id}); //profile is matched to unique user id

                         //if profile already exists; then update it
                         if(profile){
                             profile = await Profile.findOneAndUpdate({user : req.user.id}, {$set: profileFields}, {new: true}) // 1st parameter for fetching the profile by id, 2nd ($set) one for updating profilefields object, 3rd(new) for
                             return res.json(profile);
                         }

                         //if not exists; Create one
                         profile = new Profile(profileFields);

                         await profile.save();
                         res.json(profile);
                         
                     } catch (err) {
                         console.error(err.message);
                         res.status(500).send("Server Error for profile create/update");
                         
                     }


                  }
            )



module.exports = router;