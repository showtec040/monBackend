// backend/src/controllers/courierController.js

const Courier = require('../models/courier');
const Agent = require('../models/agent');
const Notification = require('../models/Notification'); // adapte le chemin si besoin

// Envoyer un courrier
exports.sendCourier = async (req, res) => {
    try {
        const { expediteur, destinataire, objet, message, fichier } = req.body;
        // Validation des champs obligatoires
        if (!expediteur || !destinataire || !objet || !message) {
            return res.status(400).json({ success: false, message: 'Tous les champs obligatoires doivent être renseignés.' });
        }
        // Vérification que expediteur est un ObjectId
        const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(id);
        if (!isValidObjectId(expediteur)) {
            return res.status(400).json({ success: false, message: 'Expéditeur invalide (ObjectId attendu).' });
        }
        // Ici, destinataire = nom du département/direction (string)
        // On cherche le directeur chef de direction de ce département
        const directeur = await Agent.findOne({ departement: destinataire, fonction: /directeur chef de direction/i });
        if (!directeur) {
            return res.status(400).json({ success: false, message: 'Aucun Directeur Chef de direction trouvé pour ce département.' });
        }
        // Création du courrier avec le vrai destinataire (ObjectId du directeur)
        const newCourier = new Courier({
            expediteur,
            destinataire: directeur._id,
            objet,
            message,
            fichier
        });
        await newCourier.save();

        await Notification.create({
            userId: directeur._id, // Correction ici pour utiliser le champ userId
            message: "Vous avez reçu un courrier.",
            date: new Date(),
            lu: false
        });

        res.status(201).json({ success: true, courier: newCourier });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Recevoir les courriers reçus par un agent (directeur)
exports.getReceivedCouriers = async (req, res) => {
    try {
        const { agentId } = req.params;
        const couriers = await Courier.find({ destinataire: agentId }).populate('expediteur', 'nomComplet');
        res.status(200).json({ success: true, couriers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Confirmer la réception d'un courrier
exports.confirmReceipt = async (req, res) => {
    try {
        const courrier = await Courier.findById(req.params.id);
        if (!courrier) return res.status(404).json({ message: "Courrier non trouvé." });

        courrier.recu = true;
        await courrier.save();

        // Récupérer le nom complet du destinataire
        let destinataireNom = "";
        try {
            const dest = await Agent.findById(courrier.destinataire);
            destinataireNom = dest ? dest.nomComplet : "";
        } catch {}

        // Notification pour le destinataire (confirmation de réception)
        await Notification.create({
            userId: courrier.destinataire,
            message: `Vous avez bien confirmé la réception du courrier "${courrier.objet}".`,
            lu: false,
            date: new Date()
        });

        // Notification pour l'expéditeur (accusé de réception)
        await Notification.create({
            userId: courrier.expediteur,
            message: `Votre courrier "${courrier.objet}" a été reçu par ${destinataireNom}.`,
            lu: false,
            date: new Date()
        });

        res.json({ success: true, message: "Réception confirmée." });
    } catch (err) {
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

// Récupérer les courriers envoyés par un agent
exports.getSentCouriers = async (req, res) => {
  try {
    const courriers = await Courier.find({ expediteur: req.params.agentId })
      .populate('destinataire', 'nomComplet')
      .sort({ dateEnvoi: -1 });
    res.json({ courriers });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Correction : export des bons noms de fonctions pour les routes
module.exports = {
    sendCourier: exports.sendCourier,
    getReceivedCouriers: exports.getReceivedCouriers,
    confirmReceipt: exports.confirmReceipt,
    getSentCouriers: exports.getSentCouriers
};