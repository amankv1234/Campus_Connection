const express = require('express');
const router = express.Router();
const { sendMessage, getMessages, getGroupMessages } = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, sendMessage);
router.get('/:userId', protect, getMessages);
router.get('/group/:groupId', protect, getGroupMessages);

module.exports = router;
