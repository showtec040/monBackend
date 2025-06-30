const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

router.get('/', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: "Utilisateur non spécifié." });
  const notifications = await Notification.find({ userId }).sort({ date: -1 });
  res.json(notifications);
});

// Marquer toutes les notifications comme lues pour un utilisateur
router.put('/markAllRead', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: "Utilisateur non spécifié." });
  await Notification.updateMany({ userId, lu: false }, { $set: { lu: true } });
  res.json({ success: true });
});

router.get('/count', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: "Utilisateur non spécifié." });
  const count = await Notification.countDocuments({ lu: false, userId });
  res.json({ count });
});

router.post('/',
  async (req, res) => {
    const { courrier } = req.body;
    await Notification.create({
      userId: courrier.destinataire, // l'ID du destinataire
      message: `Vous avez bien confirmé la réception du courrier "${courrier.objet}".`,
      lu: false,
      date: new Date()
    });
    res.status(201).send();
  }
);

module.exports = router;
