const express = require('express');
const router = express.Router();
const Message = require('../models/message').Message;

// Compter les messages non lus pour un utilisateur
router.get('/unread/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const count = await Message.countDocuments({ to: userId, lu: false });
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Récupérer l'historique entre deux utilisateurs
router.get('/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const messages = await Message.find({
            $or: [
                { from: user1, to: user2 },
                { from: user2, to: user1 }
            ]
        }).sort({ date: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Enregistrer un message
router.post('/', async (req, res) => {
    try {
        const { from, to, message, type, fileName, date } = req.body;
        const msg = await Message.create({ from, to, message, type, fileName, date });
        res.json(msg);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Marquer les messages comme lus
router.put('/read/:from/:to', async (req, res) => {
    try {
        await Message.updateMany(
            { from: req.params.from, to: req.params.to, lu: false },
            { $set: { lu: true } }
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;