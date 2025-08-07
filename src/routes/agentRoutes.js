const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');
const multer = require('multer');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Dossier où stocker les fichiers (crée-le si besoin)
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage });
const Agent = require('../models/agent');
const { authenticateToken } = require('../utils/auth');

// Création d'agent avec upload de fichiers
router.post(
  '/',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  agentController.createAgent
);
<<<<<<< HEAD

// Récupérer tous les agents
router.get('/', agentController.getAllAgents);

=======

// Récupérer tous les agents (protégé)
router.get('/', authenticateToken, agentController.getAllAgents);

>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)
// Routes spécifiques AVANT les routes dynamiques
router.get('/fonction/:fonction', async (req, res) => {
  const agents = await Agent.find({ fonction: req.params.fonction });
  res.json(agents);
});

router.get('/fonction/:fonction/departement/:departement', async (req, res) => {
  const agents = await Agent.find({
    fonction: req.params.fonction,
    departement: req.params.departement
  });
  res.json(agents);
});

router.get('/en-attente/departement/:departement', agentController.getAgentsEnAttenteByDepartement);

// Modification du mot de passe (cohérence avec le frontend)
router.put('/:id/password', agentController.changePassword);
// Modification des infos personnelles
router.put('/agents/:id/infos', agentController.updateInfosPersonnelles);
// Donner accès à un agent (niveau + délai)
router.post('/:id/activer-compte', async (req, res) => {
  try {
    const { niveauAcces, delaiAcces } = req.body;
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: "Agent non trouvé" });
    agent.niveauAcces = niveauAcces;
    let minutes = 0;
    if (delaiAcces === '30min') minutes = 30;
    else if (delaiAcces === '3H') minutes = 180;
    else if (delaiAcces === '5H') minutes = 300;
    else if (delaiAcces === '24H') minutes = 1440;
    else minutes = 60;
    agent.accesExpireAt = new Date(Date.now() + minutes * 60000);
    await agent.save();
    res.json({ success: true, message: "Accès attribué", expireAt: agent.accesExpireAt, niveau: agent.niveauAcces });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Enregistrer l'empreinte digitale d'un agent
router.post('/:id/enregistrer-empreinte', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: "Agent non trouvé" });
    const { empreinteId } = req.body;
    if (!empreinteId) return res.status(400).json({ success: false, message: "Empreinte manquante" });
    agent.empreinteId = empreinteId;
    await agent.save();
    res.json({ success: true, message: "Empreinte enregistrée", agent });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});
<<<<<<< HEAD
// Récupérer un agent par ID
router.get('/:id', agentController.getAgentById);

// Modification d'un agent (avec upload)
=======
// Récupérer un agent par ID (protégé)
router.get('/:id', authenticateToken, agentController.getAgentById);

// Modification d'un agent (avec upload, protégé)
>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)
router.put(
  '/:id',
  authenticateToken,
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  agentController.updateAgent
);
<<<<<<< HEAD

// Validation, complétion, suppression
router.put('/valider/:id', agentController.validerAgent);
router.put('/completer/:id', agentController.completerInfosAgent);
router.delete('/:id', agentController.deleteAgent);

=======

// Validation, complétion, suppression (protégées)
router.put('/valider/:id', authenticateToken, agentController.validerAgent);
router.put('/completer/:id', authenticateToken, agentController.completerInfosAgent);
router.delete('/:id', authenticateToken, agentController.deleteAgent);

>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)
// Upload de photo seule
router.put('/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: "Agent non trouvé" });
    if (req.file) {
      agent.photo = '/uploads/' + req.file.filename;
      await agent.save();
      return res.json({ success: true, photo: agent.photo });
    } else {
      return res.status(400).json({ success: false, message: "Aucun fichier envoyé" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
});


<<<<<<< HEAD
// Authentification
=======
// Authentification avec JWT
const jwt = require('jsonwebtoken');
const { secret } = require('../utils/auth');
const bcrypt = require('bcryptjs');

>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)
router.post('/login', async (req, res) => {
  try {
    const { loginInput, password } = req.body;
    if (!loginInput || !password) {
      return res.json({ success: false, message: "Champs manquants." });
    }
    const agent = await Agent.findOne({
      $or: [
        { email: loginInput },
        { matricule: loginInput }
      ]
    });
    if (!agent) {
      return res.json({ success: false, message: "Identifiant ou mot de passe incorrect." });
    }
    if (agent.statut !== "validé") {
      return res.json({
        success: false,
        message: "Votre compte n'est pas encore activé. Veuillez apporter vos documents auprès de votre secrétaire de direction pour la mise à jour de vos informations personnelles et la validation."
      });
    }
<<<<<<< HEAD
    if (agent.password !== password) {
      return res.json({ success: false, message: "Identifiant ou mot de passe incorrect." });
    }
    res.json({ success: true, agent });
=======
    // Vérification du mot de passe hashé
    const passwordMatch = await bcrypt.compare(password, agent.password);
    if (!passwordMatch) {
      return res.json({ success: false, message: "Identifiant ou mot de passe incorrect." });
    }
    // Génération du token JWT
    const token = jwt.sign({ id: agent._id, email: agent.email }, secret, { expiresIn: '24h' });
    res.json({ success: true, token, agent });
>>>>>>> d8273cb (Mise à jour backend : sécurité, email, corrections)
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// Vérification email/téléphone
router.post('/verifier', async (req, res) => {
  const { email, telephone } = req.body;
  const exist = await Agent.findOne({
    $or: [
      { email },
      { telephone }
    ]
  });
  if (exist) {
    if (exist.email === email) {
      return res.json({ existe: true, message: "Cet email est déjà utilisé." });
    }
    if (exist.telephone === telephone) {
      return res.json({ existe: true, message: "Ce numéro de téléphone est déjà utilisé." });
    }
  }
  res.json({ existe: false });
});

module.exports = router;
