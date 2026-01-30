const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getConversations } = require('../controllers/chatController');
const auth = require('../middleware/auth');

router.post('/send', auth, sendMessage);
router.get('/conversations', auth, getConversations);
router.get('/:userId', auth, getMessages);

module.exports = router;
