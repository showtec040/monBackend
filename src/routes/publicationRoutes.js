const express = require('express');
const router = express.Router();
const Publication = require('../models/Publication'); // adapte le chemin 

// Ajouter une publication
router.post('/', async (req, res) => {
    try {
        const { titre, contenu, auteur, mediaUrl, mediaType } = req.body;
        const nouvellePublication = new Publication({
            titre,
            contenu,
            auteur,
            mediaUrl,
            mediaType,
            date: new Date()
        });
        const saved = await nouvellePublication.save();
        res.json(saved);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur" });
    }
});

// ... (mets ici les routes PUT et DELETE déjà envoyées)
module.exports = router;
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
