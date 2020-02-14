
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

router.get('/:post_id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.post_id);
  
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



// Private DELETE request to delete userpost by ID (single post)
  router.delete('/:post_id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.post_id);
  
      // Check for ObjectId format and post
      if (!post) {
        return res.status(404).json({ msg: 'Post not found' });
      }
  
      // Check user
      if (post.user.toString() !== req.user.id) { // here 'req.user.id' is string and 'post.user' is object id; so used tostring for matching with string
        return res.status(401).json({ msg: 'User not authorized' });
      }
  
      await post.remove();
  
      res.json({ msg: 'Post removed' });
    } catch (err) {
      console.error(err.message);
        if(err.kind == 'ObjectId') // This is for detecting a special kind of error! User id => "5e29e8a7f17c3814689b5cca" is valid but what if we pass 1 as a user id? it will throw to catch block. therefore we put a msg here also that the user id is not valid
            return res.status(400).json({msg: 'Post not found'});
  
      res.status(500).send('Server Error for deleting post');
    }
  });




// Private PUT request to like userpost by ID (single post)
router.put('/like/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    // Check if the post has already been liked
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0 
    ) {
      return res.status(400).json({ msg: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id }); // we could use push but to put the most recent like at the begining used unshift

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error for liking Userpost!');
  }
});


// Private PUT request to unlike userpost by ID (single post)
router.put('/unlike/:post_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    // Check if the post has already been liked, if it's not liked there is nothing to unlike
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: 'Post has not yet been liked' });
    }

    // Get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error for unliking Userpost!');
  }
});




// Private POST request to add comment in a user post by postid
router.post(
  '/comment/:post_id',
  [
    auth,
    [
      check('text', 'Text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.post_id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);




module.exports = router;