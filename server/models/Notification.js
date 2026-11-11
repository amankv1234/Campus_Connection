const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['like', 'comment', 'message', 'group_invite', 'opportunity', 'connection'], required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String } // Link to redirect when clicked
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
