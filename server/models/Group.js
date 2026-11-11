const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  avatar: { type: String, default: 'https://cdn-icons-png.flaticon.com/512/33/33308.png' }
}, { timestamps: true });

module.exports = mongoose.model('Group', groupSchema);
