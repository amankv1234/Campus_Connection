const User = require('../models/User');
const Post = require('../models/Post');
const Opportunity = require('../models/Opportunity');
const Event = require('../models/Event');

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getStats = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const opportunityCount = await Opportunity.countDocuments();
    const eventCount = await Event.countDocuments();

    res.status(200).json({
      users: userCount,
      posts: postCount,
      opportunities: opportunityCount,
      events: eventCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      await user.deleteOne();
      res.status(200).json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete any post
// @route   DELETE /api/admin/posts/:id
// @access  Private/Admin
const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      await post.deleteOne();
      res.status(200).json({ message: 'Post removed' });
    } else {
      res.status(404).json({ message: 'Post not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all posts
// @route   GET /api/admin/posts
// @access  Private/Admin
const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate('user', 'name profilePic').sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getStats,
  getAllUsers,
  deleteUser,
  deletePost,
  getAllPosts
};
