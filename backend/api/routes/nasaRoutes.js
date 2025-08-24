const express = require('express');
const router = express.Router();
const { getGhgData } = require('../controllers/nasaController');

router.get('/ghg', getGhgData);

module.exports = router;