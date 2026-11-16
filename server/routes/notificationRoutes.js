const express = require('express');
const router = express.Router();
const { getNotifications, markAsRead, getUnreadCount } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.get('/unread-count', protect, getUnreadCount);
router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
