const express = require('express');
const router = express.Router();
const { getAnalysis } = require('../controllers/analysisController');

// This route will trigger the data fetching and AI analysis
router.get('/', getAnalysis);

module.exports = router;