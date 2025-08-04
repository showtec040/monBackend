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

// Création d'agent avec upload de fichiers et hash du mot de passe
const bcrypt = require('bcryptjs');
router.post(
  '/',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  async (req, res, next) => {
    try {
      // On récupère les données du formulaire
      const { email, password, fonction, departement, ...autres } = req.body;
      // Hash du mot de passe
      const hash = await bcrypt.hash(password, 10);
      // Création de l'agent avec le mot de passe hashé
      const agentData = {
        email,
        password: hash,
        fonction,
        departement,
        ...autres
      };
      // Ajout des fichiers uploadés si présents
      if (req.files && req.files['photo'] && req.files['photo'][0]) {
        agentData.photo = '/uploads/' + req.files['photo'][0].filename;
      }
      if (req.files && req.files['documents']) {
        agentData.documents = req.files['documents'].map(f => '/uploads/' + f.filename);
      }
      const agent = new Agent(agentData);
      await agent.save();
      res.json({ success: true, agent });
    } catch (err) {
      next(err);
    }
  }
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
router.put('/:id/password', agentController.changePassword);
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

// Authentification sécurisée avec JWT et bcrypt
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const JWT_SECRET = 'votre_cle_secrete_super_longue'; // À mettre dans un .env

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
    // Vérification du mot de passe hashé
    const valid = await bcrypt.compare(password, agent.password);
    if (!valid) {
      return res.json({ success: false, message: "Identifiant ou mot de passe incorrect." });
    }
    // Génération du token JWT
    const token = jwt.sign(
      { id: agent._id, fonction: agent.fonction, email: agent.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ success: true, agent, token });
  } catch (err) {
    console.error("Erreur lors de la connexion :", err);
    res.status(500).json({ success: false, message: "Erreur serveur." });
  }
});

// Middleware pour protéger les routes (à utiliser sur les routes sensibles)
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token manquant' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token invalide' });
    req.user = user;
    next();
  });
}
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
