const express = require('express');
const router = express.Router();
const { getEcoScores } = require('../controllers/ecoScoreController');

router.get('/', getEcoScores);

module.exports = router;