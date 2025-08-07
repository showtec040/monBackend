const express = require('express');
const router = express.Router();
const Publication = require('../models/publication'); // adapte le chemin si besoin
const Notification = require('../models/Notification'); // adapte le chemin si besoin

// Afficher toutes les publications
router.get('/', async (req, res) => {
    try {
        const publications = await Publication.find().sort({ date: -1 });
        res.json(publications);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Ajouter une publication + notification
router.post('/', async (req, res) => {
    try {
        const { titre, contenu, auteur, nomAuteur, mediaUrl, mediaType } = req.body;
        const nouvellePublication = new Publication({
            titre,
            contenu,
            auteur,
            nomAuteur,
            mediaUrl,
            mediaType,
            date: new Date()
        });
        const saved = await nouvellePublication.save();

<<<<<<< HEAD
        // Création de la notification
        const notif = new Notification({
            message: `Nouvelle publication : ${titre}`,
            auteur: nomAuteur || auteur,
            via: "Publication",
            createdAt: new Date()
        });
        await notif.save();
=======
        // Création de la notification pour chaque agent
        const Agent = require('../models/agent');
        const agents = await Agent.find({}, '_id');
        const notifications = agents.map(agent => ({
            userId: agent._id,
            message: `Nouvelle publication : ${titre}`,
            date: new Date(),
            lu: false
        }));
        await Notification.insertMany(notifications);
>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)

        res.json(saved);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Modifier une publication
router.put('/:id', async (req, res) => {
    try {
        const { titre, contenu } = req.body;
        const updated = await Publication.findByIdAndUpdate(
            req.params.id,
            { titre, contenu },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: "Publication non trouvée" });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// Supprimer une publication
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Publication.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: "Publication non trouvée" });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

module.exports = router;
