const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const DocumentArchive = require('../models/documentArchive');
const Agent = require('../models/agent');
const fs = require('fs');

// Config Multere bon maint
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads/archives'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage });

// Upload document ou media
router.post('/archives/upload', upload.single('file'), async (req, res) => {
    try {
        const doc = new DocumentArchive({
            numeroDoc: req.body.numeroDoc, // <-- ici
            titre: req.body.titre,
            type: req.body.type || 'document',
            filename: req.file.filename,
            originalname: req.file.originalname,
            departement: req.body.departement,
            uploadedBy: req.body.uploadedBy
        });
        await doc.save();
        res.json({ success: true, doc });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// Liste des documents/vidéos pour le département de l'utilisateur connecté
router.get('/archives', async (req, res) => {
    try {
        const filter = {};
        const type = req.query.type;
        if (req.query.departement) filter.departement = req.query.departement;
        if (type) filter.type = type;
        const docs = await DocumentArchive.find(filter).sort({ createdAt: -1 });
        res.json(docs);
    } catch (err) {
        console.error("Erreur API /archives :", err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// Suppression d'un document avec vérification du mot de passe
router.delete('/archives/:id', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, message: "Mot de passe requis." });
        }
        // Récupérer l'email de l'utilisateur connecté (envoyé par le frontend)
        const email = req.headers['x-user-email'] || req.body.email;
        if (!email) {
            return res.status(400).json({ success: false, message: "Email utilisateur requis." });
        }
        const agent = await Agent.findOne({ email });
        if (!agent) {
            return res.status(404).json({ success: false, message: "Utilisateur non trouvé." });
        }
        if (agent.password !== password) {
            return res.status(401).json({ success: false, message: "Mot de passe incorrect." });
        }
        // Suppression du document
        const doc = await DocumentArchive.findById(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: "Document non trouvé." });
        }
        // Supprimer le fichier physique
        const filePath = path.join(__dirname, '../../uploads/archives', doc.filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        await doc.deleteOne();
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;