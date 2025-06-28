const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentControllers');
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

// Routes pour les agents
router.post(
  '/',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  agentController.createAgent
);
router.get('/', agentController.getAllAgents);

// Place cette route AVANT /:id
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

router.get('/:id', agentController.getAgentById);
router.put(
  '/:id',
  upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  agentController.updateAgent
);
router.put('/valider/:id', agentController.validerAgent);
router.put('/completer/:id', agentController.completerInfosAgent);
router.put('/agents/:id/infos', agentController.updateInfosPersonnelles);
router.put('/agents/:id/password', agentController.changePassword);
router.delete('/:id', agentController.deleteAgent);
router.post('/login', async (req, res) => {
    try {
        const { loginInput, password } = req.body;
        if (!loginInput || !password) {
            return res.json({ success: false, message: "Champs manquants." });
        }

        // Recherche par email OU matricule
        const agent = await Agent.findOne({
            $or: [
                { email: loginInput },
                { matricule: loginInput }
            ]
        });

        if (!agent) {
            return res.json({ success: false, message: "Identifiant ou mot de passe incorrect." });
        }

        // Vérifie le statut du compte
        if (agent.statut !== "validé") {
            return res.json({
                success: false,
                message: "Votre compte n'est pas encore activé. Veuillez apporter vos documents auprès de votre secrétaire de direction pour la mise à jour de vos informations personnelles et la validation."
            });
        }

        // Vérification du mot de passe
        if (agent.password !== password) {
            return res.json({ success: false, message: "Identifiant ou mot de passe incorrect." });
        }

        // Connexion réussie
        res.json({ success: true, agent });
    } catch (err) {
        console.error("Erreur lors de la connexion :", err);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
});
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

// Route pour mettre à jour la photo d'un agent
router.put('/:id/photo', upload.single('photo'), async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: "Agent non trouvé" });

    // Si tu utilises multer, req.file contient le fichier uploadé
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
router.post('/attribuer-admin-provisoire', agentController.attribuerAdminProvisoire);
// POST /api/agents/annuler-admin-provisoire
router.post('/annuler-admin-provisoire', async (req, res) => {
  const { agentId } = req.body;
  await Agent.findByIdAndUpdate(agentId, {
      adminProvisoire: false,
      adminProvisoireExpire: null
  });
  res.json({ success: true });
});


module.exports = router;
