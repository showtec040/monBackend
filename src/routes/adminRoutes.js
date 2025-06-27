const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Route pour lire le fichier de logs du serveur
router.get('/logs', (req, res) => {
    const logPath = path.join(__dirname, '../../logs/server.log'); // adapte le chemin si besoin
    fs.readFile(logPath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ success: false, message: "Impossible de lire les logs." });
        }
        res.json({ success: true, logs: data });
    });
});

module.exports = router;