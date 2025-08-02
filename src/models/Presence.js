const mongoose = require('mongoose');

const agentPresenceSchema = new mongoose.Schema({
    numeroInscription: String,
    nomComplet: String,
    grade: String,
    fonction: String,
    heureArrivee: String,
    heureDepart: String,
    statut: String,
    rapport:String
}, { _id: false });

const presenceSchema = new mongoose.Schema({
    date: { type: String, required: true },
    agents: [agentPresenceSchema],
    statut: { type: String, default: "non signé" },
    departement: { type: String, required: true } // Ajout du champ département
});

module.exports = mongoose.model('Presence', presenceSchema);
