const mongoose = require('mongoose');

const commentaireSchema = new mongoose.Schema({
    auteur: String,
    contenu: String,
    date: { type: Date, default: Date.now }
});

const publicationSchema = new mongoose.Schema({
    titre: String,
    contenu: String,
    auteur: String,
    date: { type: Date, default: Date.now },
    mediaUrl: String,
    mediaType: String,
    likes: [{ type: String }], // tableau d'ID utilisateur ayant liké
    commentaires: [commentaireSchema],
   
});

module.exports = mongoose.model('Publication', publicationSchema);