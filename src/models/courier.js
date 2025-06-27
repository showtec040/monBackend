const mongoose = require('mongoose');

const courierSchema = new mongoose.Schema({
    expediteur: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    objet: { type: String, required: true },
    courierNum: { type: String },
    message: { type: String, required: true },
    destinataire: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    nomFichier: { type: String },
    fichierUrl: { type: String },
    dateEnvoi: { type: Date, default: Date.now },
    recu: { type: Boolean, default: false }
});
module.exports = mongoose.model('Courier', courierSchema);