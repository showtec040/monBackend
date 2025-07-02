const express = require('express');
const router = express.Router();
const Agent = require('../models/agent');
const Notification = require('../models/Notification');
const StatistiquePresence = require('../models/StatistiquePresence');
// GET /api/presence/stats
// GET /api/presence/stats
router.get('/', async (req, res) => {
    console.log("📊 Requête GET /api/presence/stats reçue");
    try {
        const stats = await StatistiquePresence.find().sort({ date: -1 });
        res.status(200).json(stats);
    } catch (error) {
        console.error('❌ Erreur récupération stats:', error);
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques", error });
    }
});

// POST /api/presence/stats
router.post('/', async (req, res) => {
    try {
        // 1. Enregistrer les statistiques dans la base
        const stats = await StatistiquePresence.create(req.body);

        // 2. Trouver le Secrétaire Général
        const secretaire = await Agent.findOne({ fonction: "Secrétaire Général" });
        if (!secretaire) {
            return res.status(404).json({ message: "Secrétaire Général non trouvé" });
        }

        // 3. Créer une notification pour le Secrétaire Général
        await Notification.create({
            userId: secretaire._id,
            titre: "Nouvelles statistiques de présence",
            message: "Des statistiques de présence viennent d’être enregistrées.",
            date: new Date(),
            lu: false
        });

        res.status(200).json({ message: "Statistiques enregistrées et notification envoyée !" });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l’enregistrement", error });
    }
});


module.exports = router;
