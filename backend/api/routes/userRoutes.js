const express = require('express');
const router = express.Router();
const { getUserProfile, findUsersBySkill } = require('../controllers/userController');

// Define routes
router.get('/:userId', getUserProfile);
router.get('/match/:skill', findUsersBySkill);

module.exports = router;