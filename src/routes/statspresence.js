const express = require('express');
const router = express.Router();
const StatPresence = require('../models/StatPresence');
const Notification = require('../models/Notification');
// GET /api/statspresence
router.get('/', async (req, res) => {
    try {
        const stats = await StatPresence.find().sort({ date: -1 });
        res.status(200).json(stats);
    } catch (error) {
        console.error('❌ Erreur récupération stats:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques", error: error.message });
    }
});

// POST /api/statspresence
router.post('/', async (req, res) => {
    try {
        // Si le body est un tableau, on l'utilise tel quel, sinon on le met dans un tableau
        const statsArray = Array.isArray(req.body) ? req.body : [req.body];
        // On vérifie que chaque objet a bien les champs requis
        for (const stat of statsArray) {
            if (!stat.departement || stat.totalAgents == null || stat.totalPresence == null || stat.totalAbsence == null) {
                return res.status(400).json({ message: "Format de statistique invalide." });
            }
        }

      
        // Insertion en base
        const stats = await StatPresence.insertMany(statsArray);
        res.status(200).json({ message: "Statistiques enregistrées !", stats });
    } catch (error) {
        console.error('❌ Erreur enregistrement stats:', error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement des statistiques", error: error.message });
    }
});
module.exports = router;
