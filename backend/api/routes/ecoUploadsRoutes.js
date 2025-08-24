const express = require('express');
const router = express.Router();
const { getEcoUploads } = require('../controllers/ecoUploadsController');

// Defines the endpoint for fetching validated user uploads
router.get('/', getEcoUploads);

module.exports = router;