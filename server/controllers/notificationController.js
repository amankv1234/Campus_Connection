const Notification = require('../models/Notification');

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
    return notification;
  } catch (error) {
    console.error('Notification Error:', error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  createNotification
};
