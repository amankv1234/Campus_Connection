const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: { type: String, default: '' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null } // If posted in a group
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
