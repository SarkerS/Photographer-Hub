
const express = require('express');
const router = express.Router();
const request = require('request');
const config = require ('config');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/Users');
const Post = require('../../models/Post');
const {check, validationResult} = require('express-validator');


router.get('/', (req, res) => res.send('User post route'));





// Private POST request to create or update user profile

router.post('/', [auth, //using middleware
    //Checking for the error
     [check('text', 'Please write something!!!').not().isEmpty()]],
      async (req, res)=> {
          const errors = validationResult(req);
          if(!errors.isEmpty()){
              return res.status(400).json({errors: errors.array()});
          }
          
          try {

            //find user and bring it by user id to attach post to it
            const user = await User.findById(req.user.id).select('-password');

            //Create object
            const newPost = new Post({

                text: req.body.text,
                name: user.name,
                avatar: user.avatar,
                user: req.user.id
            });
              
            //save post
            const post = await newPost.save();

            res.json(post);

          } catch (err) {
            console.error(err.message);
            res.status(500).send("Server Error for UserPost");
          }




          

          
         
      }
)








module.exports = router;