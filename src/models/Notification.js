const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    message: String,
    date: { type: Date, default: Date.now },
    lu: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // Ajout de l'ID utilisateur concerné
});

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);