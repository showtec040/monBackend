const Publication = require('../models/Publication');

exports.getAllPublications = async (req, res) => {
    const publications = await Publication.find().sort({ date: -1 });
    res.json(publications);
};

exports.createPublication = async (req, res) => {
    try {
        const pub = new Publication(req.body);
        await pub.save();
        res.json(pub);
    } catch (err) {
        console.error(err); // Ajoute ce log pour voir l’erreur dans la console serveur
        res.status(500).json({ message: err.message });
    }
};

// Like d'une publication
exports.likePublication = async (req, res) => {
    const { userId } = req.body;
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ message: "Publication non trouvée" });

    if (pub.likes.includes(userId)) {
        return res.json({ alreadyLiked: true, likesCount: pub.likes.length });
    }
    pub.likes.push(userId);
    await pub.save();
    res.json({ alreadyLiked: false, likesCount: pub.likes.length });
};

// Ajouter un commentaire
exports.addCommentaire = async (req, res) => {
    const { auteur, contenu } = req.body;
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ message: "Publication non trouvée" });

    pub.commentaires.push({ auteur, contenu });
    await pub.save();
    res.json(pub.commentaires[pub.commentaires.length - 1]);
};

// Récupérer les commentaires
exports.getCommentaires = async (req, res) => {
    const pub = await Publication.findById(req.params.id);
    if (!pub) return res.status(404).json({ message: "Publication non trouvée" });
    res.json(pub.commentaires);
};


