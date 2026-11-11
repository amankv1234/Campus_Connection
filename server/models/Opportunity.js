const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  type: { type: String, enum: ['Internship', 'Job', 'Hackathon'], required: true },
  applyLink: { type: String, required: true },
  deadline: { type: Date, required: true },
  image: { type: String, default: '' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Opportunity', opportunitySchema);
