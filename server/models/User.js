const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: '' },
  branch: { type: String, default: '' },
  year: { type: String, default: '' },
  skills: [{ type: String }],
  interests: [{ type: String }],
  profilePic: { type: String, default: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg' },
  projects: [{
    title: String,
    description: String,
    link: String
  }],
  githubLink: { type: String, default: '' },
  linkedinLink: { type: String, default: '' },
  resumeUrl: { type: String, default: '' },
  points: { type: Number, default: 0 },
  connections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAdmin: { type: Boolean, default: false },
  views: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
