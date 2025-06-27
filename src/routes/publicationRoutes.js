const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publicationController');

router.get('/', publicationController.getAllPublications);
router.post('/', publicationController.createPublication);
router.post('/:id/like', publicationController.likePublication);

module.exports = router;