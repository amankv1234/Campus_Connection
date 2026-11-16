const Notification = require('../models/Notification');
const { redis, isConnected } = require('../config/redis');

// @desc    Get user unread notifications count (Redis Fast Cache)
// @route   GET /api/notifications/unread-count
// @access  Private
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const redisKey = `user:${userId}:unread_notifs`;

    if (isConnected()) {
      try {
        const cached = await redis.get(redisKey);
        if (cached !== null) {
          return res.status(200).json({ count: parseInt(cached, 10) });
        }
      } catch (err) {
        console.warn('[Redis Unread] Read error:', err.message);
      }
    }

    // Fallback to MongoDB
    const count = await Notification.countDocuments({ recipient: userId, read: false });

    if (isConnected()) {
      redis.set(redisKey, count, 'EX', 3600).catch(() => {});
    }

    res.status(200).json({ count });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'name profilePic')
      .sort({ createdAt: -1 });
    
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    notification.read = true;
    await notification.save();

    // Decrement or clear Redis unread counter
    if (isConnected()) {
      const redisKey = `user:${req.user.id}:unread_notifs`;
      redis.decr(redisKey).then(val => {
        if (val < 0) redis.set(redisKey, 0);
      }).catch(() => {});
    }

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a notification manually (helper)
const createNotification = async (recipient, sender, type, content, link) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      content,
      link
    });

    // Increment recipient unread counter in Redis
    if (isConnected() && recipient) {
      redis.incr(`user:${recipient.toString()}:unread_notifs`).catch(() => {});
    }

    return notification;
  } catch (error) {
    console.error('Notification Error:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification,
  getUnreadCount
};
