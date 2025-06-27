const express = require('express');
const router = express.Router();
const Courier = require('../models/courier');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const courierController = require('../controllers/courierController');
const Notification = require('../models/Notification');
const Agent = require('../models/agent'); // si tu veux le nom du destinataire

// Route pour envoyer un courrier
router.post('/', upload.single('fichier'), async (req, res) => {
    try {
        const { expediteur, objet, courierNum, message, destinataire } = req.body;
        if (!expediteur || !objet || !message || !destinataire) {
            return res.status(400).json({ message: "Tous les champs obligatoires doivent être renseignés." });
        }
        let nomFichier = null;
        let fichierUrl = null;
        if (req.file) {
            nomFichier = req.file.originalname;
            fichierUrl = `/uploads/${req.file.filename}`;
        }
        const courrier = await Courier.create({
            expediteur,
            objet,
            courierNum,
            message,
            destinataire,
            nomFichier,
            fichierUrl
        });

        const expediteurAgent = await Agent.findById(expediteur);
        const expediteurNom = expediteurAgent ? expediteurAgent.nomComplet : "Un utilisateur";

        // Après création du courrier
        await Notification.create({
            userId: destinataire, // l'ID du destinataire
            message: `Vous avez reçu un nouveau courrier de ${expediteurNom}`,
            lu: false,
            date: new Date()
        });

        res.json({ success: true, courrier });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

// Route pour récupérer les courriers reçus par un agent (directeur)
router.get('/recus/:id', async (req, res) => {
    try {
        const courriers = await Courier.find({ destinataire: req.params.id })
            .populate('expediteur', 'nomComplet')
            .sort({ dateEnvoi: -1 });
        res.json({ courriers });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

// Route pour confirmer la réception d'un courrier
router.post('/:id/confirmer', courierController.confirmReceipt);

// Route pour récupérer les courriers envoyés par un agent
router.get('/envoyes/:agentId', courierController.getSentCouriers);

// Exemple de route notifications
router.get('/notifications', async (req, res) => {
  const userId = req.query.userId; // ou récupéré via le token
  const notifications = await Notification.find({ userId }).sort({ date: -1 });
  res.json(notifications);
});

// Route pour récupérer tous les courriers
router.get('/', async (req, res) => {
    try {
        const courriers = await Courier.find();
        res.json(courriers);
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
});

module.exports = router;

// Controller
exports.confirmReceipt = async (req, res) => {
  try {
    const courrier = await Courier.findById(req.params.id);
    if (!courrier) return res.status(404).json({ message: "Courrier non trouvé." });

    courrier.recu = true;
    await courrier.save();

    // Récupérer le nom du destinataire (optionnel)
    let destinataireNom = "";
    try {
      const dest = await Agent.findById(courrier.destinataire);
      destinataireNom = dest ? dest.nomComplet : "";
    } catch {}

    // Créer une notification pour l'expéditeur
    await Notification.create({
      userId: courrier.destinataire, // l'ID du destinataire
      message: `Vous avez bien confirmé la réception du courrier "${courrier.objet}".`,
      lu: false,
      date: new Date()
    });

    res.json({ success: true, message: "Réception confirmée." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};