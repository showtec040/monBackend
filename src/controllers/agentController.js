const Agent = require('../models/agent');
const Notification = require('../models/Notification');

// Créer un nouvel agent
exports.createAgent = async (req, res) => {
    try {
        // Vérification email ou téléphone déjà utilisé
        const exist = await Agent.findOne({
            $or: [
                { email: req.body.email },
                { telephone: req.body.telephone }
            ]
        });
        if (exist) {
            return res.status(400).json({
                success: false,
                message: "Cet email ou ce numéro de téléphone est déjà utilisé."
            });
        }

        // Vérification pour les fonctions uniques PAR DEPARTEMENT
        const fonctionsUniques = [
            "Directeur Chef de services",
            "Secrétaire de Direction",
            "Archiviste"
        ];
        // Fonctions globalement uniques (un seul compte pour toute la base)
        const fonctionsGlobalementUniques = [
            "Secrétaire Général",
            "Directeur des ressources humaines"
        ];
        if (fonctionsUniques.includes(req.body.fonction)) {
            const existFonction = await Agent.findOne({
                fonction: req.body.fonction,
                departement: req.body.departement
            });
            if (existFonction) {
                return res.status(400).json({
                    success: false,
                    message: `Il existe déjà un utilisateur avec la fonction "${req.body.fonction}" dans ce département.`
                });
            }
        }
        // Vérification pour SG et DRH (un seul compte pour toute la base)
        if (fonctionsGlobalementUniques.includes(req.body.fonction)) {
            const existFonctionUnique = await Agent.findOne({
                fonction: req.body.fonction
            });
            if (existFonctionUnique) {
                return res.status(400).json({
                    success: false,
                    message: `Il existe déjà un utilisateur avec la fonction "${req.body.fonction}".`
                });
            }
        }

        if (!req.body.nomComplet || !req.body.email || !req.body.telephone ||
            !req.body.departement || !req.body.fonction || !req.body.grade ||
            !req.body.matricule || !req.body.password) {
            return res.status(400).json({ success: false, message: "Champs obligatoires manquants." });
        }

        // Détermination du numéro d'inscription
        let numeroInscription = null;
        if (req.body.fonction === "Directeur Chef de services") {
            numeroInscription = 1;
        } else if (req.body.fonction === "Secrétaire de Direction") {
            numeroInscription = 2;
        } else if (["Directeur des ressources humaines", "Secrétaire Général"].includes(req.body.fonction)) {
            numeroInscription = null; // ou une logique spéciale si besoin
        } else {
            // Pour les autres fonctions, cherche le max des numéros déjà attribués dans ce département (>2)
            const maxAgent = await Agent.findOne({
                departement: req.body.departement,
                numeroInscription: { $gte: 3 }
            }).sort({ numeroInscription: -1 });
            numeroInscription = maxAgent && maxAgent.numeroInscription
                ? maxAgent.numeroInscription + 1
                : 3;
        }

        // Récupération des fichiers envoyés par Multer
        const photo = req.files && req.files.photo ? req.files.photo[0].filename : 'default_user.png';
        const documents = req.files && req.files.documents
            ? req.files.documents.map(f => f.filename)
            : [];

        const nouvelAgent = new Agent({
            nomComplet: req.body.nomComplet,
            sexe: req.body.sexe,
            nomPere: req.body.nomPere,
            nomMere: req.body.nomMere,
            lieuNaissance: req.body.lieuNaissance,
            dateNaissance: req.body.dateNaissance,
            province: req.body.province,
            territoire: req.body.territoire,
            adresse: req.body.adresse,
            email: req.body.email,
            telephone: req.body.telephone,
            departement: req.body.departement,
            grade: req.body.grade,
            fonction: req.body.fonction,
            matricule: req.body.matricule,
            pieceIdentite: req.body.pieceIdentite,
            numeroPiece: req.body.numeroPiece,
            Diplome: req.body.Diplome,
            photo: photo,
            documents: documents,
            password: req.body.password,
            statut: ["Directeur Chef de services", "Secrétaire de Direction","Directeur des ressources humaines","Secrétaire Général"].includes(req.body.fonction)
                ? "validé"
                : "en attente de mise à jour",
            numeroInscription: numeroInscription
        });
        await nouvelAgent.save();
        res.json({ success: true, statut: nouvelAgent.statut, numeroInscription: nouvelAgent.numeroInscription });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
};

// Récupérer tous les agents
exports.getAllAgents = async (req, res) => {
    try {
        const agents = await Agent.find();
        res.status(200).send(agents);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Récupérer un agent par ID
exports.getAgentById = async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) {
            return res.status(404).send();
        }
        res.status(200).send(agent);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Mettre à jour un agent par ID
exports.updateAgent = async (req, res) => {
    try {
        const agent = await Agent.findById(req.params.id);
        if (!agent) {
            return res.status(404).json({ success: false, message: "Agent non trouvé" });
        }
        // Construction dynamique des champs à mettre à jour
        const updateFields = {};
        const allowedFields = [
            'nomComplet', 'email', 'telephone', 'departement', 'fonction', 'grade', 'matricule',
            'nomPere', 'nomMere', 'nationalite', 'province', 'territoire', 'adresse', 'dateNaissance',
            'lieuNaissance', 'sexe', 'pieceIdentite', 'numeroPiece', 'Diplome', 'statut'
        ];
        allowedFields.forEach(function(field) {
            if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                // Conversion date
                if (field === 'dateNaissance' && req.body[field]) {
                    updateFields[field] = new Date(req.body[field]);
                } else {
                    updateFields[field] = req.body[field];
                }
            }
        });
        // Si on fait une mise à jour d'informations manquantes, on force le statut à "en attente de validation"
        if (req.body.statut === 'en attente de validation') {
            updateFields.statut = 'en attente de validation';
        }
        // Gestion des fichiers (photo, documents) si besoin
        if (req.files && req.files.photo && req.files.photo[0]) {
            updateFields.photo = '/uploads/' + req.files.photo[0].filename;
        }
        if (req.files && req.files.documents) {
            updateFields.documents = req.files.documents.map(f => '/uploads/' + f.filename);
        }
        // Mise à jour
        Object.assign(agent, updateFields);
        await agent.save();
        res.status(200).json({ success: true, agent });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Supprimer un agent par ID
exports.deleteAgent = async (req, res) => {
    try {
        const agent = await Agent.findByIdAndDelete(req.params.id);
        if (!agent) {
            return res.status(404).send();
        }
        res.status(200).send(agent);
    } catch (error) {
        res.status(500).send(error);
    }
};

exports.getAgentsEnAttenteByDepartement = async (req, res) => {
    try {
        const agents = await Agent.find({
            departement: req.params.departement,
            statut: "en attente de mise à jour"
        });
        res.json(agents);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.validerAgent = async (req, res) => {
  try {
    // Si on valide l'agent, on lui attribue un numéro d'inscription unique
    let update = { statut: req.body.statut };
    if (req.body.statut === "validé") {
      // Compte le nombre d'agents déjà validés pour donner le prochain numéro
      const lastAgent = await Agent.findOne({ numeroInscription: { $ne: null } })
        .sort({ numeroInscription: -1 });
      update.numeroInscription = lastAgent ? lastAgent.numeroInscription + 1 : 1;
    }
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    // --- AJOUT : Notifier tous les DRH si statut validé ---
    if (agent && agent.statut === "validé") {
      const drhs = await Agent.find({ fonction: "Directeur des ressources humaines" });
      const notifications = drhs.map(drh => ({
        destinataire: drh._id,
        message: `L'agent ${agent.nomComplet || agent.matricule} a été validé.`,
        date: new Date(),
        lu: false
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }
    res.json(agent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.completerInfosAgent = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        statut: "en attente de validation"
      },
      { new: true }
    );
    res.json(agent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateInfosPersonnelles = async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    // Créer une notification
    await Notification.create({
      message: `Les informations personnelles de ${agent.nomComplet} ont été modifiées.`
    });
    res.json(agent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id);
    if (!agent) return res.status(404).json({ success: false, message: "Agent non trouvé" });

    // Vérifie l'ancien mot de passe (adapté au frontend)
    const ancienMotDePasse = req.body.ancienMotDePasse;
    const nouveauMotDePasse = req.body.nouveauMotDePasse;

    if (agent.password !== ancienMotDePasse) {
      return res.status(400).json({ success: false, message: "Ancien mot de passe incorrect." });
    }

    agent.password = nouveauMotDePasse;
    await agent.save();
    res.json({ success: true, message: "Mot de passe mis à jour avec succès." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

exports.attribuerAdminProvisoire = async (req, res) => {
    try {
        const { agentId, dureeMinutes } = req.body;
        const agent = await Agent.findById(agentId);
        if (!agent) return res.status(404).json({ success: false, message: "Agent non trouvé" });
        // Ici tu peux ajouter la logique pour attribuer le rôle provisoire et la durée
        agent.roleProvisoire = true;
        agent.roleExpireAt = new Date(Date.now() + (parseInt(dureeMinutes) || 60) * 60000);
        await agent.save();
        res.json({ success: true, message: "Admin provisoire attribué", expireAt: agent.roleExpireAt });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

exports.annulerAdminProvisoire = async (req, res) => {
    try {
        const { agentId } = req.body;
        const agent = await Agent.findById(agentId);
        if (!agent) return res.status(404).json({ success: false, message: "Agent non trouvé" });
        agent.roleProvisoire = false;
        agent.roleExpireAt = null;
        await agent.save();
        res.json({ success: true, message: "Rôle admin provisoire annulé" });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
