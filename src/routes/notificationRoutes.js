const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');

router.get('/', async (req, res) => {
  const userId = req.query.userId;
  if (!userId) return res.status(400).json({ message: "Utilisateur non spécifié." });
  const notifications = await Notification.find({ userId }).sort({ date: -1 });
  res.json(notifications);
});

// CORRECTION ICI : juste '/:id'
router.delete('/:id', async (req, res) => {
  try {
    const notif = await Notification.findByIdAndDelete(req.params.id);
    if (!notif) {
      return res.status(404).json({ success: false, message: "Notification introuvable." });
    }
    res.json({ success: true, message: "Notification supprimée." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

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

// Pour émettre via Socket.IO
const { getIO } = require('../socket');

router.post('/', async (req, res) => {
  const { courrier } = req.body;
  const notif = await Notification.create({
    userId: courrier.destinataire,
    message: `Vous avez bien confirmé la réception du courrier "${courrier.objet}".`,
    lu: false,
    date: new Date()
  });
  // Émission de l'événement Socket.IO au destinataire
  try {
    const io = getIO && getIO();
    if (io) {
      io.to(courrier.destinataire).emit('newNotification', notif);
    }
  } catch {}
  res.status(201).send();
});

module.exports = router;
