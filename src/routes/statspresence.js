const express = require('express');
const router = express.Router();
const StatPresence = require('../models/StatPresence');
const Notification = require('../models/Notification');
const Agent = require('../models/agent'); // adapte le chemin si besoin

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
        const statsArray = Array.isArray(req.body) ? req.body : [req.body];
        for (const stat of statsArray) {
            if (!stat.departement || stat.totalAgents == null || stat.totalPresence == null || stat.totalAbsence == null) {
                return res.status(400).json({ message: "Format de statistique invalide." });
            }
        }
        const stats = await StatPresence.insertMany(statsArray);

        const secretaire = await Agent.findOne({ fonction: "Secrétaire Général" });
        if (secretaire) {
            await Notification.create({
                userId: secretaire._id,
                titre: "Nouvelles statistiques de présence",
                message: "Des statistiques de présence viennent d’être envoyés.",
                date: new Date(),
                lu: false
            });
        }

        res.status(200).json({ message: "Statistiques enregistrées !", stats });
    } catch (error) {
        console.error('❌ Erreur enregistrement stats:', error);
        res.status(500).json({ message: "Erreur lors de l'enregistrement des statistiques", error: error.message });
    }
});

// DELETE /api/statspresence
router.delete('/', async (req, res) => {
    try {
        await StatPresence.deleteMany({});
        res.status(200).json({ message: "Toutes les statistiques ont été supprimées." });
    } catch (error) {
        console.error('❌ Erreur suppression stats:', error);
        res.status(500).json({ message: "Erreur lors de la suppression des statistiques", error: error.message });
    }
});

module.exports = router;
