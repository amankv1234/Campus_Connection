const Message = require('../models/Message');
const User = require('../models/User');
const { createNotification } = require('./notificationController');

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { receiverId, groupId, content } = req.body;

    if (!receiverId && !groupId) {
      return res.status(400).json({ message: 'Receiver ID or Group ID is required' });
    }
    if (!content) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const newMessage = await Message.create({
      sender: req.user.id,
      receiver: receiverId || null,
      group: groupId || null,
      content
    });

    const populatedMessage = await newMessage.populate('sender receiver', 'name profilePic');

    // Notify receiver
    if (receiverId) {
      await createNotification(
        receiverId,
        req.user.id,
        'message',
        `${req.user.name} sent you a message`,
        `/chat?user=${req.user.id}`
      );
    }

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: req.params.userId },
        { sender: req.params.userId, receiver: req.user.id }
      ]
    })
    .populate('sender receiver', 'name profilePic')
    .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group messages
// @route   GET /api/messages/group/:groupId
// @access  Private
const getGroupMessages = async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.groupId })
      .populate('sender', 'name profilePic')
      .sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendMessage,
  getMessages,
  getGroupMessages
};
