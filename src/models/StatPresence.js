const mongoose = require('mongoose');

const StatPresenceSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  departement: { type: String, required: true },
  totalAgents: { type: Number, required: true },
  totalPresence: { type: Number, required: true },
  totalAbsence: { type: Number, required: true }
});

module.exports = mongoose.model('StatPresence', StatPresenceSchema, 'statistiquepresences');
