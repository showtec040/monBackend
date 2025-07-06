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

// Création d'agent avec upload de fichiers
router.post(
  '/',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  agentController.createAgent
);

// Récupérer tous les agents
router.get('/', agentController.getAllAgents);

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
router.put('/agents/:id/password', agentController.changePassword);
// Modification des infos personnelles
router.put('/agents/:id/infos', agentController.updateInfosPersonnelles);

// Récupérer un agent par ID
router.get('/:id', agentController.getAgentById);

// Modification d'un agent (avec upload)
router.put(
  '/:id',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  agentController.updateAgent
);

// Validation, complétion, suppression
router.put('/valider/:id', agentController.validerAgent);
router.put('/completer/:id', agentController.completerInfosAgent);
router.delete('/:id', agentController.deleteAgent);

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

// Admin provisoire
router.post('/attribuer-admin-provisoire', agentController.attribuerAdminProvisoire);
router.post('/annuler-admin-provisoire', async (req, res) => {
  const { agentId } = req.body;
  await Agent.findByIdAndUpdate(agentId, {
    adminProvisoire: false,
    adminProvisoireExpire: null
  });
  res.json({ success: true });
});

// Authentification
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
    if (agent.password !== password) {
      return res.json({ success: false, message: "Identifiant ou mot de passe incorrect." });
    }
    res.json({ success: true, agent });
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
