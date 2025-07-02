const express = require('express');
const router = express.Router();
const StatPresence = require('../models/StatPresence');

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
        // Peut recevoir un tableau ou un objet unique
        const body = Array.isArray(req.body) ? req.body : [req.body];
        const stats = await StatPresence.insertMany(body);
        res.status(200).json({ message: "Statistiques enregistrées !", stats });
    } catch (error) {
        console.error('❌ Erreur enregistrement stats:', error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement des statistiques", error: error.message });
    }
});

module.exports = router;
