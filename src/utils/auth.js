const jwt = require('jsonwebtoken');

const secret = 'votre_cle_secrete'; // À placer dans une variable d'environnement en production

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token manquant' });
  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Token invalide' });
    req.user = user;
    next();
  });
}

module.exports = { authenticateToken, secret };
