const express = require('express');
const router = express.Router();
const triageController = require('../controllers/triageController');

// POST /api/triage/chat
router.post('/chat', triageController.chatTriage);

// POST /api/triage/translate
router.post('/translate', triageController.translateTextEndpoint);

module.exports = router;
