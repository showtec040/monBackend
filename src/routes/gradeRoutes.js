const express = require('express');
const router = express.Router();

const grades = [
  { code: 110, label: "SG" },
  { code: 120, label: "DIR" },
  { code: 130, label: "CD" },
  { code: 140, label: "CB" },
  { code: 210, label: "ATA1" },
  { code: 220, label: "ATA2" },
  { code: 310, label: "AGA1" },
  { code: 320, label: "AGA2" },
  { code: 330, label: "AA1" },
  { code: 340, label: "AAA2" },
  { code: 350, label: "HUIS" }
];

router.get('/', (req, res) => {
  res.json(grades);
});

module.exports = router;