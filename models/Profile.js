const mongoose = require ('mongoose');

const ProfileSchema = new mongoose.Schema({
    user: { // this is basically a reference to user model; cause every profile is associated with user
      type: mongoose.Schema.Types.ObjectId, // type is the unique id in the database; not visible in our user model!
      ref: 'user' // and which model we are referencing
    },
    organization: {
      type: String
    },
    website: {
      type: String
    },
    location: {
      type: String
    },
    role: {
      type: String,
      required: true
    },
    skills: {
      type: [String], // Array of skills 
      required: true
    },
    bio: {
      type: String
    },
    flickerusername: {
      type: String
    },
    experience: [
      {
        title: {
          type: String,
          required: true
        },
        organization: {
          type: String,
          required: true
        },
        location: {
          type: String
        },
        from: {
          type: Date,
          required: true
        },
        to: {
          type: Date
        },
        current: { // Is it a current job or previous one?
          type: Boolean,
          default: false
        },
        description: {
          type: String
        }
      }
    ],
    education: [
      {
        school: {
          type: String,
          required: true
        },
        degree: {
          type: String,
          required: true
        },
        fieldofstudy: {
          type: String,
          required: true
        },
        from: {
          type: Date,
          required: true
        },
        to: {
          type: Date
        },
        current: {
          type: Boolean,
          default: false
        },
        description: {
          type: String
        }
      }
    ],
    social: {
      youtube: {
        type: String
      },
      twitter: {
        type: String
      },
      facebook: {
        type: String
      },
      linkedin: {
        type: String
      },
      instagram: {
        type: String
      }
    },
    date: {
      type: Date,
      default: Date.now
    }
  });
  
  module.exports = Profile = mongoose.model('profile', ProfileSchema);