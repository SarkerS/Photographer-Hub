// This profile route will have multiple different api request
// like a get request for the current user proifile(e.g. private based on current token) or all user profile

const express = require('express');
const request = require('request');
const config = require ('config');
const router = express.Router();
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/Users');
const {check, validationResult} = require('express-validator');

  

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
                      
                      //Taking input  
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


// Public GET request to get all profile

router.get('/', async (req, res)=> {

    try {
        const profile = await Profile.find().populate('user', ['name', 'avatar']);
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error for fetching all profile');
        
    }
})


// Public GET request to get a profile by a single user Id
// here we pass a id in the url as a parameter
router.get('/user/:user_id', async (req, res)=> { // user_id is the parameter

    try {
        const profile = await Profile.findOne({user : req.params.user_id }).populate('user', ['name', 'avatar']);

        //Error checking if the profile is there or not!
        if(!profile)
            return res.status(400).json({msg: 'Profile does not exists!!'});

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId') // This is for detecting a special kind of error! User id => "5e29e8a7f17c3814689b5cca" is valid but what if we pass 1 as a user id? it will throw to catch block. therefore we put a msg here also that the user id is not valid
            return res.status(400).json({msg: 'Profile does not exists!!'});
        res.status(500).send('Server error for fetching all profile');
        
    }
})


// Private DELETE request to remove user, profile and associated posts

router.delete('/', auth, async (req, res)=> {

    try {
        // deleting profile
        await Profile.findOneAndDelete({user: req.user.id});

        //User Removed
        await User.findOneAndDelete({ _id: req.user.id});

        res.json({msg: 'User and associated posts are removed'});

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error for deleting a profile');
        
    }
})


// Private PUT request to add Experience/ could use POST but try new

router.put('/experience', [auth, //using middleware cz private
            //Checking for the error
            [check('title', 'What is your Position?').not().isEmpty(),
            check ('organization', 'Organization name is required.').not().isEmpty(),
            check ('from', 'When did you engaged with the Organization?').not().isEmpty()]], async (req, res)=> {

            const errors = validationResult(req);
                    if(!errors.isEmpty()){
                        return res.status(400).json({errors: errors.array()});
                    }
                    
                    //Taking Input 
                    const {
                    title,
                    organization,
                    location,
                    from,
                    to,
                    current,
                    description
                    } = req.body;

                    //Creating an object
                    const expObj = {
                        title,
                        organization,
                        location,
                        from,
                        to,
                        current,
                        description
                        }



            try {
                
                const profile = await Profile.findOne({user: req.user.id});

                profile.experience.unshift(expObj);

                await profile.save();

                res.json(profile);

            } catch (err) {
                console.error(err.message);
                res.status(500).send('Server error for adding an experience in the profile');
                
            }
})


// Private DELETE request to remove experiences from the user profile

router.delete('/experience/:exp_id', auth, async (req, res)=> {

    try {
        const profile = await Profile.findOne({user: req.user.id});

        // get the index number in the experience array to remove it
        const index = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(index, 1) // splicing the particular experience

        await profile.save();

        res.json(profile);
        

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error for deleting an Experience');
        
    }
})



// Private PUT request to add Education/ could use POST but try new

router.put('/education', [auth, //using middleware cz private
    //Checking for the error
    [check('school', 'What is your School?').not().isEmpty(),
    check ('fieldofstudy', 'Program name is required.').not().isEmpty(),
    check ('from', 'When did you start the School?').not().isEmpty()]], async (req, res)=> {

    const errors = validationResult(req);
            if(!errors.isEmpty()){
                return res.status(400).json({errors: errors.array()});
            }
            
            //Taking Input 
            const {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
            } = req.body;

            //Creating an object
            const eduObj = {
            school,
            degree,
            fieldofstudy,
            from,
            to,
            current,
            description
                }



    try {
        
        const profile = await Profile.findOne({user: req.user.id});

        profile.education.unshift(eduObj);

        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error for adding an education in the profile');
        
    }
})


// Private DELETE request to remove education from the user profile

router.delete('/education/:edu_id', auth, async (req, res)=> {

try {
const profile = await Profile.findOne({user: req.user.id});

// get the index number in the education array to remove it
const index = profile.education.map(item => item.id).indexOf(req.params.edu_id);

profile.education.splice(index, 1) // splicing the particular education

await profile.save();

res.json(profile);


} catch (err) {
console.error(err.message);
res.status(500).send('Server error for deleting an Education');

}
})






module.exports = router;