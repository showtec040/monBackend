const mongoose = require('mongoose');

const statistiquePresenceSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    departement: String,
    totalAgents: Number,
    totalPresence: Number,
    totalAbsence: Number

});

module.exports = mongoose.model('StatistiquePresence', statistiquePresenceSchema);