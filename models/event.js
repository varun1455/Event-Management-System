const mongoose = require('mongoose');
// const { Schema } = mongoose;

const eventSchema = new mongoose.Schema({
  title: String,
  description: String,
  date: Date,
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  reminders: [{ type: Date }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);