const express = require('express');
const router = express.Router();

const fonctions = [
  "Secrétaire Général",
  "Directeur des ressources humaines",
  "Directeur Chef de services",

  "Secrétaire de Direction",
  "Chef de Division",
  "Chef de Bureau",
  "Attaché d'administration 1",
  "Attaché d'administration 2",
  "Agent d'administration 1",
  "Agent d'administration 2",
  "Huissier 1",
  "Huissier 2",
  "Archiviste"
];

router.get('/', (req, res) => {
  res.json(fonctions);
});

module.exports = router;