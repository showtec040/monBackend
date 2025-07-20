const express = require('express');
const router = express.Router();
const Presence = require('../models/Presence');
const Agent = require('../models/agent');
const Notification = require('../models/Notification');

// Helper pour obtenir la date du jour sans l'heure
function getDateSansHeure(date = new Date()) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Enregistrement d'une présence
router.post('/', async (req, res) => {
    try {
        const { date, agents, userId, departement } = req.body; // Ajout du champ departement
        if (!date || !Array.isArray(agents) || !userId || !departement) {
            return res.status(400).json({ message: "Données manquantes." });
        }
        // Vérifie s'il existe déjà une présence pour ce jour et ce département
        const dejaEnregistre = await Presence.findOne({ date, departement });
        if (dejaEnregistre) {
            return res.status(400).json({ message: "La présence du jour a déjà été enregistrée pour ce département." });
        }
        // Crée le document de présence du jour
        await Presence.create({ date, agents, departement });

        // Cherche le directeur chef de services du même département
        const agentConnecte = await Agent.findById(userId);
        if (agentConnecte) {
            const directeur = await Agent.findOne({
                departement: agentConnecte.departement,
                fonction: /directeur chef de services/i
            });
            if (directeur) {
                await Notification.create({
                    userId: directeur._id,
                    message: `Une nouvelle liste de présence a été envoyée pour le département ${agentConnecte.departement}.`,
                    date: new Date(),
                    lu: false
                });
            }
        }
        res.json({ success: true, message: 'Présence(s) enregistrée(s) avec succès !' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur lors de l\'enregistrement.' });
    }
});

// Vérifier si la présence du jour existe déjà pour un département
router.get('/', async (req, res) => {
    try {
        const { date, departement } = req.query;
        if (date && departement) {
            const dejaEnregistre = await Presence.exists({ date, departement });
            return res.json({ dejaEnvoye: !!dejaEnregistre });
        }
        // Sinon, retourne toutes les présences
        const presences = await Presence.find().sort({ date: -1 });
        res.json(presences);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const presence = await Presence.findById(req.params.id);
        if (!presence) return res.status(404).json({ message: 'Présence non trouvée.' });
        res.json(presence);
    } catch (err) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la présence.' });
    }
});

// Signature d'une présence + notification DRH
router.put('/:id/signer', async (req, res) => {
    try {
        const presence = await Presence.findById(req.params.id);
        if (!presence) return res.status(404).json({ success: false, message: "Présence non trouvée" });
        presence.statut = "signé";
        await presence.save();

        // Notifier le Directeur des ressources humaines
        const drh = await Agent.findOne({ fonction: /directeur des ressources humaines/i });
        if (drh) {
            await Notification.create({
                userId: drh._id,
                message: `La présence du ${presence.date} pour le département ${presence.departement} a été envoyé par le directeur chef de service.`,
                date: new Date(),
                lu: false
            });
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});

module.exports = router;
