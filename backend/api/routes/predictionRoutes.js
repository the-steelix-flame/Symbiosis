const express = require('express');
const router = express.Router();
const { getDeforestationPrediction, getPlasticPrediction, getCoralPrediction } = require('../controllers/predictionController');

// Defines the endpoint for deforestation predictions
router.get('/deforestation', getDeforestationPrediction);

// Defines the endpoint for plastic waste predictions
router.get('/plastic', getPlasticPrediction);

// Defines the endpoint for coral bleaching predictions
router.get('/coral', getCoralPrediction);

module.exports = router;