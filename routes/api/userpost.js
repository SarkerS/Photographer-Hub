
const express = require('express');
const router = express.Router();
const request = require('request');
const config = require ('config');
const auth = require('../../middleware/auth');
const Profile = require('../../models/Profile');
const User = require('../../models/Users');
const Post = require('../../models/Post');


const multer = require('multer');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './UserPostImages/');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname);
    }
  });

const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 1024 * 1024 * 5 // five Mb max size image
  },
  fileFilter: fileFilter
});


const {check, validationResult} = require('express-validator');





// Private POST request to create user post

router.post('/', upload.single('userimage'), // multer middleware for file uploading 
    [auth, //using middleware
    //Checking for the error
     [check('text', 'Please write something!!!').not().isEmpty()]],
     
      async (req, res)=> {
          console.log(req.file);
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
                user: req.user.id,
                image: req.file.path 
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


// Private GET request to fetch all userpost

router.get('/', auth, async (req, res) => {
    try {
      const posts = await Post.find().sort({ date: -1 }); // we want to LIFO manner posts, meaning last post should be fetch first
      res.json(posts);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error for fetching all UserPost');
    }
  });



// Private GET request to fetch userpost by ID (single post)

router.get('/:user_id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.user_id);
  
      // Check for ObjectId format and post
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      res.json(post);
    } catch (err) {
        console.error(err.message);
        if(err.kind == 'ObjectId') // This is for detecting a special kind of error! User id => "5e29e8a7f17c3814689b5cca" is valid but what if we pass 1 as a user id? it will throw to catch block. therefore we put a msg here also that the user id is not valid
            return res.status(400).json({msg: 'Post not found'});
  
      res.status(500).send('Server Error for fetching UserPost by id');
    }
  });




module.exports = router;