const express = require('express');
const router = express.Router();

const departements = [
  "Secrétariat Général(S.G)",
  "Direction des ressources humaines (DRH)",
  "Direction Administrative et Finance (DAF)",
  "Direction d'Etudes et Planification (DEP)",
  "Direction des Archives et Nouvelles Technologies de l'Informations et de la Communication (DANTIC)",
  "Direction des Affaires Juridiques et Contentieux (DA.JC)",
  "Direction de la Coordination de la Décentralisation Sectorielle (DCDSR)",
  "Direction de la Coopération Décentralisée (DCD)",
  "Direction des Investissements et Finances locales (DIFL)",
  "Direction du Suivi du Découpage Territorial (DSMDT)",
  "Direction Suivi & Évaluation Décentralisation (DSEMD)",
  "POOL1", "POOL2", "POOL3", "POOL4", "POOL5", "POOL6"
];

router.get('/', (req, res) => {
  res.json(departements);
});

module.exports = router;