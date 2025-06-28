require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const http = require('https');
const app = require('./app');
const { setupSocket } = require('./socket'); // à créer si pas déjà fait
const PORT = process.env.PORT || 3000;
const path = require('path');


// Connexion à la base de données MongoDB Atlas ou locale
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pad', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('Connexion à la base de données réussie');
    // Créer le serveur HTTP
    const server = http.createServer(app);

    // Initialiser Socket.IO
    setupSocket(server);

    // Démarrer le serveur
    server.listen(PORT, () => {
        console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
    });
})
.catch(err => {
    console.error('Erreur de connexion à la base de données:', err);
});



